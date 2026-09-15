<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $staff = User::where('restaurant_id', $restaurantId)
            ->with('role')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($staff);
    }

    public function store(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role_id' => 'required|exists:roles,id',
            'pin' => 'required|string|size:4',
            'is_active' => 'nullable|boolean',
        ]);

        $user = User::create([
            'restaurant_id' => $restaurantId,
            'role_id' => $validated['role_id'],
            'name' => $validated['name'],
            'pin_hash' => Hash::make($validated['pin']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json($user->load('role'), 201);
    }

    public function show(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $user = User::where('restaurant_id', $restaurantId)->with('role')->findOrFail($id);

        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $user = User::where('restaurant_id', $restaurantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'role_id' => 'sometimes|required|exists:roles,id',
            'is_active' => 'sometimes|required|boolean',
        ]);

        $user->update($validated);

        return response()->json($user->load('role'));
    }

    public function destroy(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $user = User::where('restaurant_id', $restaurantId)->findOrFail($id);
        $user->delete();

        return response()->json(['success' => true]);
    }

    public function resetPin(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $user = User::where('restaurant_id', $restaurantId)->findOrFail($id);

        $validated = $request->validate([
            'pin' => 'required|string|size:4',
        ]);

        $user->update([
            'pin_hash' => Hash::make($validated['pin']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employee PIN updated successfully.',
        ]);
    }
}
