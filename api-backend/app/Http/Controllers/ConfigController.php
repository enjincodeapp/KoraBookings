<?php

namespace App\Http\Controllers;

class ConfigController extends Controller
{
    /**
     * Public client configuration consumed by the mobile app on launch.
     * Only client-safe values belong here — never secrets.
     * GET /api/config
     */
    public function show()
    {
        return response()->json([
            'google' => [
                'webClientId' => config('services.google.web_client_id'),
                'iosClientId' => config('services.google.ios_client_id'),
                'androidClientId' => config('services.google.android_client_id'),
                'expoClientId' => config('services.google.expo_client_id'),
            ],
        ]);
    }
}
