<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    private function generateOtp()
    {
        return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $otp = $this->generateOtp();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'otp_code' => Hash::make($otp),
            'otp_expires_at' => now()->addMinutes(15),
        ]);

        // Send OTP email (Mailtrap should capture this in development)
        try {
            Mail::raw("Your verification OTP is: {$otp}", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Your verification code');
            });

            Log::info("Registration OTP for {$user->email}: {$otp} (emailed)");
        } catch (\Exception $e) {
            Log::error("Failed to send OTP email to {$user->email}: {$e->getMessage()}");
        }

        return response()->json([
            'message' => 'User registered successfully. Please check your email for the OTP.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Please verify your email address first',
                'needsVerification' => true
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    public function googleLogin(Request $request)
    {
        $validated = $request->validate([
            'id_token' => 'required|string',
        ]);

        $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $validated['id_token'],
        ]);

        if (!$response->successful()) {
            return response()->json(['message' => 'Invalid Google token'], 401);
        }

        $payload = $response->json();

        $acceptedClientIds = array_filter([
            config('services.google.web_client_id'),
            config('services.google.ios_client_id'),
            config('services.google.android_client_id'),
            config('services.google.expo_client_id'),
        ]);
        if (!empty($acceptedClientIds) && !in_array($payload['aud'] ?? null, $acceptedClientIds, true)) {
            return response()->json(['message' => 'Google token was issued for a different app'], 401);
        }

        if (($payload['email_verified'] ?? 'false') !== 'true' || empty($payload['email'])) {
            return response()->json(['message' => 'Google account email is not verified'], 401);
        }

        $user = User::where('google_id', $payload['sub'])
            ->orWhere('email', $payload['email'])
            ->first();

        if ($user) {
            $user->forceFill([
                'google_id' => $payload['sub'],
                'avatar' => $payload['picture'] ?? $user->avatar,
                'email_verified_at' => $user->email_verified_at ?? now(),
            ])->save();
        } else {
            $user = User::create([
                'name' => $payload['name'] ?? $payload['email'],
                'email' => $payload['email'],
                'google_id' => $payload['sub'],
                'avatar' => $payload['picture'] ?? null,
                'password' => Hash::make(Str::random(32)),
                'email_verified_at' => now(),
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ]
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'otp' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if (!$user->otp_code || !Hash::check($validated['otp'], $user->otp_code)) {
            return response()->json(['message' => 'Invalid OTP'], 400);
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP has expired'], 400);
        }

        // Assign directly and save to avoid mass-assignment restrictions
        $user->email_verified_at = now();
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        // email verified at does not trigger or not saved because of mass assignment protection, so we assign directly and save
        //   $user->update([
        //     'email_verified_at' => now(),
        //     'otp_code' => null,
        //     'otp_expires_at' => null,
        // ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully',
            'access_token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    public function resendOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email is already verified'], 400);
        }

        $otp = $this->generateOtp();
        
        $user->update([
            'otp_code' => Hash::make($otp),
            'otp_expires_at' => now()->addMinutes(15),
        ]);

        // Log::info("Resend OTP for {$user->email}: {$otp}");

         // Send OTP email (Mailtrap should capture this in development)
        try {
            Mail::raw("Your verification OTP is: {$otp}", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Your verification code');
            });

            Log::info("Resend OTP for {$user->email}: {$otp} (emailed)");
        } catch (\Exception $e) {
            Log::error("Failed to resend OTP email to {$user->email}: {$e->getMessage()}");
        }

        return response()->json(['message' => 'OTP sent successfully']);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            $otp = $this->generateOtp();
            $user->update([
                'otp_code' => Hash::make($otp),
                'otp_expires_at' => now()->addMinutes(15),
            ]);
            // Log::info("Forgot password OTP for {$user->email}: {$otp}");
                // Send OTP email (Mailtrap should capture this in development)
                try {
            Mail::raw("Your verification OTP is: {$otp}", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Your verification code');
            });

            Log::info("Forgot password OTP for {$user->email}: {$otp} (emailed)");
            } catch (\Exception $e) {
                Log::error("Failed to send Forgot password OTP for: {$user->email}: {$e->getMessage()}");
            }
                
            }

        // Always return success to prevent email enumeration
        return response()->json(['message' => 'If your email is registered, you will receive an OTP to reset your password.']);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'otp' => 'required|string',
            'password' => 'required|string|min:8',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['otp'], $user->otp_code)) {
            return response()->json(['message' => 'Invalid OTP or email'], 400);
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP has expired'], 400);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        return response()->json(['message' => 'Password reset successfully']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
