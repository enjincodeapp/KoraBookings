<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SpaceController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;

// Health check endpoint
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Spaces and Apartments routes
Route::get('/spaces', [SpaceController::class, 'index']);
Route::get('/spaces/{id}', [SpaceController::class, 'show']);
Route::get('/spaces/trending/asokoro', [SpaceController::class, 'trendingAsokoro']);
Route::get('/spaces/trending/wuse', [SpaceController::class, 'trendingWuse']);
Route::get('/spaces/ai/recommended', [SpaceController::class, 'aiRecommended']);
Route::get('/spaces/ai/search', [SpaceController::class, 'aiSearch']);
Route::get('/spaces/best/value', [SpaceController::class, 'bestValue']);

// User routes - for testing purposes
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// Webhook for Paystack (public, not authenticated)
Route::post('/webhooks/paystack', [PaymentController::class, 'handleWebhook']);

// Protected routes - require authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Booking routes
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/stats', [BookingController::class, 'stats']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::put('/bookings/{id}', [BookingController::class, 'update']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    
    // Payment routes
    Route::post('/bookings/{id}/initiate-payment', [PaymentController::class, 'initiatePayment']);
    Route::get('/transactions/{reference}/verify', [PaymentController::class, 'verifyPayment']);
    Route::get('/transactions', [PaymentController::class, 'getTransactionHistory']);
    Route::get('/transactions/{id}', [PaymentController::class, 'getTransactionDetails']);
    // Route::post('/bookings/{id}/request-refund', [PaymentController::class, 'requestRefund']);

    // Notification routes
    Route::controller(NotificationController::class)->prefix('notifications')->group(function () {
        Route::get('/', 'index');
        Route::get('/unread-count', 'unreadCount');
        Route::post('/read-all', 'markAllAsRead');
        Route::post('/{id}/read', 'markAsRead');
    });
});
