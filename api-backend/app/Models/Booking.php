<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'space_id',
        'date',
        'start_time',
        'end_time',
        'guests',
        'total_price',
        'status',
        'payment_status',
        'transaction_id',
        'cancelled_at',
        'cancellation_reason',
        'guest_email',
        'guest_phone',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'guests' => 'integer',
        'date' => 'date',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function space()
    {
        return $this->belongsTo(Space::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Scopes for querying bookings
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming')->where('date', '>=', now()->toDateString());
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed')->orWhere('date', '<', now()->toDateString());
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    /**
     * Check if booking is paid
     */
    public function isPaid()
    {
        return $this->payment_status === 'paid' && $this->transaction && $this->transaction->isPaid();
    }

    /**
     * Check if booking is pending payment
     */
    public function isPendingPayment()
    {
        return $this->payment_status === 'pending';
    }

    /**
     * Check if booking is cancelled
     */
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if booking is completed (past date)
     */
    public function isCompleted()
    {
        return Carbon::parse($this->date)->isPast() || $this->status === 'completed';
    }

    /**
     * Check if refund is eligible (within refund window)
     * Default: 48 hours before booking
     */
    public function isRefundEligible()
    {
        if ($this->isCancelled()) {
            return false;
        }

        $bookingDateTime = Carbon::parse($this->date . ' ' . $this->start_time);
        $hoursUntilBooking = now()->diffInHours($bookingDateTime);

        return $hoursUntilBooking >= 48; // 48-hour refund window
    }

    /**
     * Calculate refund amount
     * Implement refund policy (e.g., 80% if cancelled within 48 hours, 100% otherwise)
     */
    public function calculateRefundAmount()
    {
        if (!$this->isPaid()) {
            return 0;
        }

        $bookingDateTime = Carbon::parse($this->date . ' ' . $this->start_time);
        $hoursUntilBooking = now()->diffInHours($bookingDateTime);

        // Full refund if more than 48 hours before booking
        if ($hoursUntilBooking >= 48) {
            return $this->total_price;
        }

        // 50% refund if less than 48 hours
        return $this->total_price * 0.5;
    }
}
