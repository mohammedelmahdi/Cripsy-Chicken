<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $expenses = Expense::where('restaurant_id', $restaurantId)
            ->with('category')
            ->orderBy('date', 'desc')
            ->get();

        $categories = ExpenseCategory::where('restaurant_id', $restaurantId)->get();

        return response()->json([
            'expenses' => $expenses,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $validated = $request->validate([
            'expense_category_id' => 'required|uuid',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
        ]);

        $validated['restaurant_id'] = $restaurantId;
        $validated['user_id'] = $request->user()->id;

        $expense = Expense::create($validated);

        return response()->json($expense->load('category'), 201);
    }

    public function show(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $expense = Expense::where('restaurant_id', $restaurantId)->with('category')->findOrFail($id);

        return response()->json($expense);
    }

    public function update(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $expense = Expense::where('restaurant_id', $restaurantId)->findOrFail($id);

        $validated = $request->validate([
            'expense_category_id' => 'sometimes|required|uuid',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'date' => 'sometimes|required|date',
        ]);

        $expense->update($validated);

        return response()->json($expense->load('category'));
    }

    public function destroy(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $expense = Expense::where('restaurant_id', $restaurantId)->findOrFail($id);
        $expense->delete();

        return response()->json(['success' => true]);
    }
}
