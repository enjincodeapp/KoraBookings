<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'user_id',
        'reference',
        'payment_method',
        'amount',
        'status',
        'subtotal',
        'service_fee',
        'tax',
        'paystack_authorization_url',
        'paystack_access_code',
        'paystack_response',
        'description',
        'metadata',
        'receipt_number',
        'paid_at',
        'refunded_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'service_fee' => 'decimal:2',
        'tax' => 'decimal:2',
        'paystack_response' => 'array',
        'metadata' => 'array',
        'paid_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeRefunded($query)
    {
        return $query->where('status', 'refunded');
    }

    /**
     * Helper methods
     */
    public function isPaid()
    {
        return $this->status === 'completed';
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isFailed()
    {
        return $this->status === 'failed';
    }

    public function isRefunded()
    {
        return $this->status === 'refunded';
    }

    /**
     * Generate unique receipt number
     */
    public static function generateReceiptNumber()
    {
        $prefix = 'RCP';
        $timestamp = now()->format('YmdHis');
        $random = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        return "{$prefix}-{$timestamp}-{$random}";
    }
}
