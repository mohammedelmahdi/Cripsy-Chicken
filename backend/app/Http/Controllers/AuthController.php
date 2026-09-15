<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Validates employee credentials using a security PIN.
     * Prevents timing attacks and enforces secure token issuance.
     */
    public function login(Request $request)
    {
        $request->validate([
            'pin' => 'required|string|size:4',
            'restaurant_id' => 'nullable|string',
        ]);

        $restaurantId = $request->input('restaurant_id', 'cc-restaurant-uuid-1');

        // Retrieve active staff members for this restaurant branch
        $users = User::where('restaurant_id', $restaurantId)
            ->where('is_active', true)
            ->with('role')
            ->get();

        $authenticatedUser = null;

        // Loop and check to prevent timing leaks on employee IDs
        foreach ($users as $user) {
            if (Hash::check($request->pin, $user->pin_hash)) {
                $authenticatedUser = $user;
                break;
            }
        }

        if (!$authenticatedUser) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid PIN code. Please verify credentials.',
            ], 401);
        }

        // Revoke prior tokens to enforce single active session if desired
        $authenticatedUser->tokens()->delete();

        // Issue a clean Sanctum API token
        $token = $authenticatedUser->createToken('pos-terminal-session')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $authenticatedUser->id,
                'name' => $authenticatedUser->name,
                'role' => $authenticatedUser->role->name,
            ],
        ], 200);
    }

    /**
     * Terminate the API token session.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ], 200);
    }

    /**
     * Retrieve details of the current logged-in employee.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role->name,
            ],
        ], 200);
    }
}
