<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;
        $customers = Customer::where('restaurant_id', $restaurantId)->orderBy('name', 'asc')->get();

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['restaurant_id'] = $restaurantId;
        $customer = Customer::create($validated);

        return response()->json($customer, 201);
    }

    public function show(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $customer = Customer::where('restaurant_id', $restaurantId)->findOrFail($id);

        return response()->json($customer);
    }

    public function update(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $customer = Customer::where('restaurant_id', $restaurantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $customer->update($validated);

        return response()->json($customer);
    }

    public function destroy(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $customer = Customer::where('restaurant_id', $restaurantId)->findOrFail($id);
        $customer->delete();

        return response()->json(['success' => true]);
    }
}
