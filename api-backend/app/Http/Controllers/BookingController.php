<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    /**
     * Get all bookings for authenticated user with optional filtering
     * GET /api/bookings?filter=upcoming|past|all
     */
    public function index(Request $request)
    {
        $filter = $request->query('filter', 'all'); // upcoming, past, all

        $query = $request->user()->bookings()->with(['space', 'transaction']);

        // Apply filter
        if ($filter === 'upcoming') {
            $query->upcoming();
        } elseif ($filter === 'past') {
            $query->completed();
        }

        $bookings = $query->orderBy('date', 'desc')->paginate(15);

        return response()->json($bookings);
    }

    /**
     * Get booking details
     * GET /api/bookings/{id}
     */
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['space', 'transaction', 'user'])
            ->findOrFail($id);

        // Verify ownership
        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($booking);
    }

    /**
     * Create a new booking (initial creation, before payment)
     * POST /api/bookings
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'space_id' => 'required|exists:spaces,id',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'guests' => 'required|integer|min:1',
            'guest_email' => 'required|email',
            'guest_phone' => 'required|string',
        ]);

        $space = Space::findOrFail($validated['space_id']);

        // Validate guest count against space capacity
        if ($validated['guests'] > $space->capacity) {
            return response()->json([
                'error' => 'Guest count exceeds space capacity',
                'capacity' => $space->capacity
            ], 400);
        }

        // Calculate price
        $start = \Carbon\Carbon::parse($validated['start_time']);
        $end = \Carbon\Carbon::parse($validated['end_time']);
        $hours = $start->diffInHours($end);
        if ($hours < 1) $hours = 1;

        $totalPrice = $hours * $space->price_per_hour;

        // Create booking in pending payment status
        $booking = $request->user()->bookings()->create([
            'space_id' => $space->id,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'guests' => $validated['guests'],
            'total_price' => $totalPrice,
            'status' => 'pending', // Changed from 'upcoming' to 'pending' until payment
            'payment_status' => 'pending',
            'guest_email' => $validated['guest_email'],
            'guest_phone' => $validated['guest_phone'],
        ]);

        $booking->load('space');

        return response()->json([
            'message' => 'Booking created. Please proceed to payment.',
            'booking' => $booking
        ], 201);
    }

    /**
     * Update booking details (before payment only)
     * PUT /api/bookings/{id}
     */
    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        // Verify ownership
        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Cannot update if payment is pending or completed
        if ($booking->isPaid()) {
            return response()->json(['error' => 'Cannot modify paid booking'], 400);
        }

        // Check if booking date has passed
        if ($booking->isCompleted()) {
            return response()->json(['error' => 'Cannot modify completed booking'], 400);
        }

        $validated = $request->validate([
            'date' => 'sometimes|date|after_or_equal:today',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i',
            'guests' => 'sometimes|integer|min:1',
            'guest_email' => 'sometimes|email',
            'guest_phone' => 'sometimes|string',
        ]);

        // Recalculate price if times changed
        if (isset($validated['start_time']) || isset($validated['end_time'])) {
            $start = \Carbon\Carbon::parse($validated['start_time'] ?? $booking->start_time);
            $end = \Carbon\Carbon::parse($validated['end_time'] ?? $booking->end_time);
            $hours = $start->diffInHours($end);
            if ($hours < 1) $hours = 1;

            $validated['total_price'] = $hours * $booking->space->price_per_hour;
        }

        $booking->update($validated);
        $booking->load('space');

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking
        ]);
    }

    /**
     * Cancel booking and request refund
     * POST /api/bookings/{id}/cancel
     */
    public function cancel(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        // Verify ownership
        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if already cancelled
        if ($booking->isCancelled()) {
            return response()->json(['error' => 'Booking already cancelled'], 400);
        }

        // If not paid, just cancel it
        if (!$booking->isPaid()) {
            $booking->update([
                'status' => 'cancelled',
                'payment_status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $request->input('reason', 'User requested cancellation'),
            ]);

            return response()->json([
                'message' => 'Booking cancelled successfully',
                'booking' => $booking
            ]);
        }

        // If paid, redirect to refund endpoint (handled by PaymentController)
        return response()->json([
            'message' => 'Use /api/bookings/{id}/request-refund for paid bookings',
            'action' => 'request-refund'
        ], 400);
    }

    /**
     * Get booking statistics for user
     * GET /api/bookings/stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        $stats = [
            'total_bookings' => $user->bookings()->count(),
            'upcoming_bookings' => $user->bookings()->upcoming()->count(),
            'completed_bookings' => $user->bookings()->completed()->count(),
            'cancelled_bookings' => $user->bookings()->cancelled()->count(),
            'paid_bookings' => $user->bookings()->paid()->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Send booking confirmation email (called after payment verification)
     */
    private function sendBookingConfirmationEmail(Booking $booking)
    {
        try {
            $details = [
                'booking_id' => $booking->id,
                'space_name' => $booking->space->name ?? 'Space',
                'date' => $booking->date,
                'start_time' => $booking->start_time,
                'end_time' => $booking->end_time,
                'guests' => $booking->guests,
                'total_price' => $booking->total_price,
                'owner_contact' => $booking->space->contact_info ?? 'N/A',
                'owner_name' => $booking->space->owner ?? 'Property Owner',
            ];

            $body = "Your booking is confirmed!\n\n" .
                "Booking ID: {$details['booking_id']}\n" .
                "Space: {$details['space_name']}\n" .
                "Date: {$details['date']}\n" .
                "Time: {$details['start_time']} - {$details['end_time']}\n" .
                "Guests: {$details['guests']}\n" .
                "Total Price: ₦{$details['total_price']}\n\n" .
                "Owner Contact: {$details['owner_contact']}\n" .
                "Owner Name: {$details['owner_name']}\n\n" .
                "Please arrive 10 minutes early.\n" .
                "Thank you for booking with us!";

            Mail::raw($body, function ($message) use ($booking) {
                $message->to($booking->user->email)
                    ->subject('Booking Confirmation - #' . $booking->id);
            });

            Log::info('Booking confirmation email sent', [
                'booking_id' => $booking->id,
                'user_email' => $booking->user->email
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send booking confirmation email', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
