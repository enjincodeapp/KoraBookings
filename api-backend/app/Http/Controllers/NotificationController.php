<?php

namespace App\Http\Controllers;

use App\Http\Resources\AppNotificationResource;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * List notifications for the authenticated user
     * GET /api/notifications?filter=unread|all
     */
    public function index(Request $request)
    {
        $query = $request->query('filter') === 'unread'
            ? $request->user()->unreadNotifications()
            : $request->user()->notifications();

        $notifications = $query->paginate(20);

        return response()->json([
            'data' => AppNotificationResource::collection($notifications->items())->resolve(),
            'current_page' => $notifications->currentPage(),
            'last_page' => $notifications->lastPage(),
            'total' => $notifications->total(),
        ]);
    }

    /**
     * Get count of unread notifications
     * GET /api/notifications/unread-count
     */
    public function unreadCount(Request $request)
    {
        return response()->json(['count' => $request->user()->unreadNotifications()->count()]);
    }

    /**
     * Mark a single notification as read
     * POST /api/notifications/{id}/read
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(new AppNotificationResource($notification));
    }

    /**
     * Mark all notifications as read
     * POST /api/notifications/read-all
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
