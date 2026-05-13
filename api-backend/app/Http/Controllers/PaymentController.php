<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Exception;

class PaymentController extends Controller
{
    private $paystackBaseUrl = 'https://api.paystack.co';
    private $paystackPublicKey;
    private $paystackSecretKey;

    public function __construct()
    {
        $this->paystackSecretKey = config('services.paystack.secret_key');
        $this->paystackPublicKey = config('services.paystack.public_key');

        if (!$this->paystackSecretKey) {
            Log::error('Paystack secret key not configured');
        }
    }

    /**
     * Initiate payment for a booking
     * POST /api/bookings/{id}/initiate-payment
     */
    public function initiatePayment(Request $request, Booking $booking)
    {
        // Validate booking ownership
        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if already paid
        if ($booking->isPaid()) {
            return response()->json(['error' => 'Booking already paid'], 400);
        }

        // Validate booking is not cancelled
        if ($booking->isCancelled()) {
            return response()->json(['error' => 'Cannot pay for cancelled booking'], 400);
        }

        try {
            // Calculate fees
            $subtotal = $booking->total_price;
            $serviceFee = $subtotal * 0.05; // 5% service fee
            $tax = ($subtotal + $serviceFee) * 0.075; // 7.5% VAT
            $totalAmount = $subtotal + $serviceFee + $tax;

            // Create or update transaction
            $transaction = Transaction::firstOrCreate(
                ['booking_id' => $booking->id],
                [
                    'user_id' => $request->user()->id,
                    'reference' => 'TXN-' . uniqid(),
                    'amount' => $totalAmount,
                    'subtotal' => $subtotal,
                    'service_fee' => $serviceFee,
                    'tax' => $tax,
                    'status' => 'pending',
                    'payment_method' => 'paystack',
                    'receipt_number' => Transaction::generateReceiptNumber(),
                ]
            );

            // If transaction already exists and is completed, don't recreate
            if ($transaction->wasRecentlyCreated === false && $transaction->isPaid()) {
                return response()->json(['error' => 'Payment already completed'], 400);
            }

            // Call Paystack API to initialize payment
            $paystackResponse = $this->initializePaystackPayment(
                $transaction,
                $request->user(),
                $booking
            );

            if (!$paystackResponse['success']) {
                Log::error('Paystack initialization failed', ['error' => $paystackResponse['message']]);
                return response()->json(['error' => $paystackResponse['message']], 400);
            }

            // Update transaction with Paystack details
            $transaction->update([
                'paystack_authorization_url' => $paystackResponse['authorization_url'],
                'paystack_access_code' => $paystackResponse['access_code'],
                'paystack_response' => $paystackResponse['raw_response'],
                'status' => 'processing',
            ]);

            return response()->json([
                'success' => true,
                'transaction' => [
                    'id' => $transaction->id,
                    'reference' => $transaction->reference,
                    'amount' => $transaction->amount,
                    'authorization_url' => $paystackResponse['authorization_url'],
                    'access_code' => $paystackResponse['access_code'],
                    'fee_breakdown' => [
                        'subtotal' => (float) $transaction->subtotal,
                        'service_fee' => (float) $transaction->service_fee,
                        'tax' => (float) $transaction->tax,
                        'total' => (float) $transaction->amount,
                    ]
                ],
            ], 201);

        } catch (Exception $e) {
            Log::error('Payment initiation error', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to initiate payment. Please try again.',
                'message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Verify payment with Paystack and confirm booking
     * GET /api/transactions/{reference}/verify
     */
    public function verifyPayment(Request $request, $reference)
    {
        try {
            $transaction = Transaction::where('reference', $reference)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            // Verify with Paystack
            $headers = [
                'Authorization' => 'Bearer ' . $this->paystackSecretKey,
            ];

            $response = Http::withHeaders($headers)
                ->get("{$this->paystackBaseUrl}/transaction/verify/{$transaction->paystack_response['reference']}")
                ->json();

            if (!$response['status']) {
                return response()->json(['error' => 'Payment verification failed'], 400);
            }

            $paystackData = $response['data'];

            // Check if payment was successful
            if ($paystackData['status'] !== 'success') {
                $transaction->update(['status' => 'failed']);
                return response()->json(['error' => 'Payment not successful'], 400);
            }

            // Update transaction
            $transaction->update([
                'status' => 'completed',
                'paid_at' => now(),
                'paystack_response' => $paystackData,
            ]);

            // Update booking payment status
            $booking = $transaction->booking;
            $booking->update([
                'payment_status' => 'paid',
                'transaction_id' => $transaction->id,
                'status' => 'upcoming', // Booking is now valid
            ]);

            // Send payment confirmation email
            $this->sendPaymentConfirmationEmail($booking, $transaction);

            return response()->json([
                'success' => true,
                'message' => 'Payment verified and booking confirmed',
                'booking' => [
                    'id' => $booking->id,
                    'payment_status' => $booking->payment_status,
                    'status' => $booking->status,
                ],
                'transaction' => [
                    'id' => $transaction->id,
                    'reference' => $transaction->reference,
                    'receipt_number' => $transaction->receipt_number,
                    'amount' => $transaction->amount,
                    'status' => $transaction->status,
                ]
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Transaction not found'], 404);
        } catch (Exception $e) {
            Log::error('Payment verification error', [
                'reference' => $reference,
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Payment verification failed'], 500);
        }
    }

    /**
     * Webhook for Paystack payment confirmation
     * POST /api/webhooks/paystack
     */
    public function handleWebhook(Request $request)
    {
        // Verify webhook authenticity
        $signature = $request->header('x-paystack-signature');
        $body = $request->getContent();

        $hash = hash_hmac('sha512', $body, $this->paystackSecretKey);

        if ($hash !== $signature) {
            Log::warning('Invalid Paystack webhook signature');
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        $event = $request->json('event');
        $data = $request->json('data');

        if ($event === 'charge.success') {
            $this->handleChargeSuccess($data);
        } elseif ($event === 'charge.failed') {
            $this->handleChargeFailed($data);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Get transaction history for user
     * GET /api/transactions
     */
    public function getTransactionHistory(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->with('booking.space')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($transactions);
    }

    /**
     * Get transaction details
     * GET /api/transactions/{id}
     */
    public function getTransactionDetails(Request $request, $id)
    {
        $transaction = Transaction::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with('booking.space')
            ->firstOrFail();

        return response()->json($transaction);
    }

    /**
     * Request refund for booking
     * POST /api/bookings/{id}/request-refund
     */
    public function requestRefund(Request $request, Booking $booking)
    {
        // Validate booking ownership
        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Validate refund eligibility
        if (!$booking->isRefundEligible()) {
            return response()->json([
                'error' => 'Refund window closed',
                'message' => 'Refunds are only available 48 hours before the booking date'
            ], 400);
        }

        if (!$booking->isPaid()) {
            return response()->json(['error' => 'Booking not paid'], 400);
        }

        try {
            $transaction = $booking->transaction;
            $refundAmount = $booking->calculateRefundAmount();

            // Call Paystack refund API
            $refundResponse = $this->initiatePaystackRefund($transaction, $refundAmount);

            if (!$refundResponse['success']) {
                return response()->json(['error' => $refundResponse['message']], 400);
            }

            // Update booking status
            $booking->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $request->input('reason', 'User requested cancellation'),
                'payment_status' => 'refunded',
            ]);

            // Update transaction
            $transaction->update([
                'status' => 'refunded',
                'refunded_at' => now(),
                'paystack_response' => $refundResponse['raw_response'],
            ]);

            // Send refund confirmation email
            $this->sendRefundConfirmationEmail($booking, $transaction, $refundAmount);

            return response()->json([
                'success' => true,
                'message' => 'Refund processed successfully',
                'refund_amount' => $refundAmount,
                'booking' => [
                    'id' => $booking->id,
                    'status' => $booking->status,
                    'payment_status' => $booking->payment_status,
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Refund request error', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Failed to process refund'], 500);
        }
    }

    /**
     * Private helper: Initialize Paystack payment
     */
    private function initiatePaystackPayment(Transaction $transaction, $user, Booking $booking)
    {
        try {
            $headers = [
                'Authorization' => 'Bearer ' . $this->paystackSecretKey,
                'Content-Type' => 'application/json',
            ];

            $payload = [
                'email' => $user->email,
                'amount' => (int) ($transaction->amount * 100), // Convert to kobo
                'reference' => $transaction->reference,
                'metadata' => [
                    'booking_id' => $booking->id,
                    'space_name' => $booking->space->name,
                    'booking_date' => $booking->date,
                    'guest_count' => $booking->guests,
                    'customer_id' => $user->id,
                ],
                'callback_url' => route('payment.callback'),
            ];

            $response = Http::withHeaders($headers)
                ->post("{$this->paystackBaseUrl}/transaction/initialize", $payload)
                ->json();

            if (!$response['status']) {
                return [
                    'success' => false,
                    'message' => $response['message'] ?? 'Paystack initialization failed',
                ];
            }

            return [
                'success' => true,
                'authorization_url' => $response['data']['authorization_url'],
                'access_code' => $response['data']['access_code'],
                'raw_response' => $response['data'],
            ];

        } catch (Exception $e) {
            Log::error('Paystack initialization error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Failed to initialize payment',
            ];
        }
    }

    /**
     * Private helper: Initiate Paystack refund
     */
    private function initiatePaystackRefund(Transaction $transaction, $refundAmount)
    {
        try {
            $headers = [
                'Authorization' => 'Bearer ' . $this->paystackSecretKey,
                'Content-Type' => 'application/json',
            ];

            $payload = [
                'transaction' => $transaction->paystack_response['id'] ?? $transaction->reference,
                'amount' => (int) ($refundAmount * 100), // Convert to kobo
            ];

            $response = Http::withHeaders($headers)
                ->post("{$this->paystackBaseUrl}/refund", $payload)
                ->json();

            if (!$response['status']) {
                return [
                    'success' => false,
                    'message' => $response['message'] ?? 'Refund failed',
                ];
            }

            return [
                'success' => true,
                'raw_response' => $response['data'],
            ];

        } catch (Exception $e) {
            Log::error('Paystack refund error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Failed to process refund',
            ];
        }
    }

    /**
     * Private helper: Handle successful charge webhook
     */
    private function handleChargeSuccess($data)
    {
        try {
            $transaction = Transaction::where('reference', $data['reference'])->first();

            if (!$transaction) {
                Log::warning('Transaction not found for webhook', ['reference' => $data['reference']]);
                return;
            }

            if ($transaction->isPaid()) {
                return; // Already processed
            }

            $transaction->update([
                'status' => 'completed',
                'paid_at' => now(),
                'paystack_response' => $data,
            ]);

            $booking = $transaction->booking;
            $booking->update([
                'payment_status' => 'paid',
                'transaction_id' => $transaction->id,
                'status' => 'upcoming',
            ]);

            $this->sendPaymentConfirmationEmail($booking, $transaction);

            Log::info('Payment confirmed via webhook', ['transaction_id' => $transaction->id]);

        } catch (Exception $e) {
            Log::error('Webhook charge success error', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Private helper: Handle failed charge webhook
     */
    private function handleChargeFailed($data)
    {
        try {
            $transaction = Transaction::where('reference', $data['reference'])->first();

            if ($transaction) {
                $transaction->update(['status' => 'failed']);
            }

            Log::warning('Payment failed via webhook', ['reference' => $data['reference']]);

        } catch (Exception $e) {
            Log::error('Webhook charge failed error', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Private helper: Send payment confirmation email
     */
    private function sendPaymentConfirmationEmail(Booking $booking, Transaction $transaction)
    {
        try {
            $details = [
                'booking_id' => $booking->id,
                'transaction_reference' => $transaction->reference,
                'receipt_number' => $transaction->receipt_number,
                'space_name' => $booking->space->name,
                'booking_date' => $booking->date,
                'start_time' => $booking->start_time,
                'end_time' => $booking->end_time,
                'guests' => $booking->guests,
                'subtotal' => $transaction->subtotal,
                'service_fee' => $transaction->service_fee,
                'tax' => $transaction->tax,
                'total_amount' => $transaction->amount,
                'payment_date' => $transaction->paid_at,
                'owner_contact' => $booking->space->contact_info,
                'owner_name' => $booking->space->owner,
            ];

            $emailBody = $this->generatePaymentReceiptEmail($details);

            Mail::raw($emailBody, function ($message) use ($booking, $transaction) {
                $message->to($booking->user->email)
                    ->subject("Payment Confirmation - Receipt #{$transaction->receipt_number}");
            });

            Log::info('Payment confirmation email sent', [
                'booking_id' => $booking->id,
                'user_email' => $booking->user->email
            ]);

        } catch (Exception $e) {
            Log::error('Failed to send payment confirmation email', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Private helper: Send refund confirmation email
     */
    private function sendRefundConfirmationEmail(Booking $booking, Transaction $transaction, $refundAmount)
    {
        try {
            $details = [
                'booking_id' => $booking->id,
                'transaction_reference' => $transaction->reference,
                'original_amount' => $transaction->amount,
                'refund_amount' => $refundAmount,
                'space_name' => $booking->space->name,
                'booking_date' => $booking->date,
                'cancellation_reason' => $booking->cancellation_reason,
            ];

            $emailBody = $this->generateRefundEmailBody($details);

            Mail::raw($emailBody, function ($message) use ($booking) {
                $message->to($booking->user->email)
                    ->subject('Refund Confirmation - Booking Cancelled');
            });

            Log::info('Refund confirmation email sent', [
                'booking_id' => $booking->id,
                'refund_amount' => $refundAmount
            ]);

        } catch (Exception $e) {
            Log::error('Failed to send refund email', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Generate payment receipt email body
     */
    private function generatePaymentReceiptEmail($details)
    {
        return "
PAYMENT RECEIPT - BOOKING CONFIRMATION

Receipt Number: {$details['receipt_number']}
Booking ID: {$details['booking_id']}
Transaction Reference: {$details['transaction_reference']}

===== BOOKING DETAILS =====
Space: {$details['space_name']}
Date: {$details['booking_date']}
Time: {$details['start_time']} - {$details['end_time']}
Guests: {$details['guests']}

===== PAYMENT BREAKDOWN =====
Subtotal: ₦" . number_format($details['subtotal'], 2) . "
Service Fee (5%): ₦" . number_format($details['service_fee'], 2) . "
VAT (7.5%): ₦" . number_format($details['tax'], 2) . "
─────────────────────────
Total Amount: ₦" . number_format($details['total_amount'], 2) . "

Payment Date: {$details['payment_date']}

===== PROPERTY OWNER DETAILS =====
Owner: {$details['owner_name']}
Contact: {$details['owner_contact']}

Thank you for your booking! Please arrive 10 minutes early.

For inquiries, contact us at support@find-a-spot.com
        ";
    }

    /**
     * Generate refund email body
     */
    private function generateRefundEmailBody($details)
    {
        return "
REFUND CONFIRMATION - BOOKING CANCELLED

Booking ID: {$details['booking_id']}
Space: {$details['space_name']}

===== REFUND DETAILS =====
Original Amount: ₦" . number_format($details['original_amount'], 2) . "
Refund Amount: ₦" . number_format($details['refund_amount'], 2) . "
Cancellation Reason: {$details['cancellation_reason']}

The refund will be processed to your original payment method within 5-7 business days.

Transaction Reference: {$details['transaction_reference']}

If you have any questions, please contact us at support@find-a-spot.com
        ";
    }
}
