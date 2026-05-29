<?php

namespace App\Notifications;

use App\DataObjects\Notification as NotificationData;
use App\Models\Transaction;
use Illuminate\Notifications\Notification;

class PaymentCompletedNotification extends Notification
{
    public function __construct(protected Transaction $transaction)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return (new NotificationData)
            ->title('Payment successful')
            ->line("Your payment of ₦{$this->transaction->amount} was received and your booking is confirmed.")
            ->with('booking_id', $this->transaction->booking_id)
            ->with('reference', $this->transaction->reference)
            ->getData();
    }
}
