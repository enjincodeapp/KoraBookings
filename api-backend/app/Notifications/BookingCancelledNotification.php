<?php

namespace App\Notifications;

use App\DataObjects\Notification as NotificationData;
use App\Models\Booking;
use Illuminate\Notifications\Notification;

class BookingCancelledNotification extends Notification
{
    public function __construct(protected Booking $booking)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return (new NotificationData)
            ->title('Booking cancelled')
            ->line('Your booking has been cancelled.')
            ->with('booking_id', $this->booking->id)
            ->getData();
    }
}
