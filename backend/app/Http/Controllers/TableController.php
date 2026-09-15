<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;
        $tables = Table::where('restaurant_id', $restaurantId)->orderBy('name', 'asc')->get();

        return response()->json($tables);
    }

    public function store(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'status' => 'nullable|string|in:AVAILABLE,OCCUPIED,RESERVED,DIRTY',
            'position_x' => 'nullable|integer',
            'position_y' => 'nullable|integer',
        ]);

        $validated['restaurant_id'] = $restaurantId;
        if (empty($validated['status'])) {
            $validated['status'] = 'AVAILABLE';
        }

        $table = Table::create($validated);

        return response()->json($table, 201);
    }

    public function show(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $table = Table::where('restaurant_id', $restaurantId)->findOrFail($id);

        return response()->json($table);
    }

    public function update(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $table = Table::where('restaurant_id', $restaurantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'capacity' => 'sometimes|required|integer|min:1',
            'status' => 'nullable|string|in:AVAILABLE,OCCUPIED,RESERVED,DIRTY',
            'position_x' => 'nullable|integer',
            'position_y' => 'nullable|integer',
        ]);

        $table->update($validated);

        return response()->json($table);
    }

    public function destroy(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $table = Table::where('restaurant_id', $restaurantId)->findOrFail($id);
        $table->delete();

        return response()->json(['success' => true]);
    }

    public function updateStatus(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $table = Table::where('restaurant_id', $restaurantId)->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:AVAILABLE,OCCUPIED,RESERVED,DIRTY',
        ]);

        $table->update(['status' => $validated['status']]);

        return response()->json($table);
    }
}
