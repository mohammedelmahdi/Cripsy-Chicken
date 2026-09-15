<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CashSession;
use App\Models\CashMovement;
use App\Models\Order;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CashSessionController extends Controller
{
    /**
     * Retrieve current active session details or null.
     */
    public function status(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $activeSession = CashSession::where('restaurant_id', $restaurantId)
            ->where('status', 'OPEN')
            ->with(['openedBy'])
            ->first();

        return response()->json([
            'success' => true,
            'session' => $activeSession ? [
                'id' => $activeSession->id,
                'opened_at' => $activeSession->opened_at->toIso8601String(),
                'opened_by' => $activeSession->openedBy->name,
                'opening_cash' => (float) $activeSession->opening_cash,
                'status' => 'OPEN'
            ] : null,
        ]);
    }

    /**
     * Open a new Cash register drawer session.
     */
    public function open(Request $request)
    {
        $user = $request->user();
        $restaurantId = $user->restaurant_id;

        $request->validate([
            'opening_cash' => 'required|numeric|min:0',
        ]);

        // Guard: Prevent double-opening register sessions
        $existing = CashSession::where('restaurant_id', $restaurantId)
            ->where('status', 'OPEN')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'A register drawer session is already active.',
            ], 400);
        }

        $session = CashSession::create([
            'id' => (string) Str::uuid(),
            'restaurant_id' => $restaurantId,
            'opened_by_user_id' => $user->id,
            'opened_at' => now(),
            'opening_cash' => $request->opening_cash,
            'status' => 'OPEN',
        ]);

        AuditLog::create([
            'restaurant_id' => $restaurantId,
            'user_id' => $user->id,
            'action' => 'OPEN_CASH_SESSION',
            'entity' => 'cash_sessions',
            'entity_id' => $session->id,
            'metadata' => ['opening_cash' => $session->opening_cash],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cash register drawer opened successfully.',
            'session_id' => $session->id,
        ], 201);
    }

    /**
     * Close the register, audit expected cash vs actual physical cash,
     * and log any drawer differences or shortages.
     */
    public function close(Request $request)
    {
        $user = $request->user();
        $restaurantId = $user->restaurant_id;

        $request->validate([
            'closing_cash_actual' => 'required|numeric|min:0',
        ]);

        $session = CashSession::where('restaurant_id', $restaurantId)
            ->where('status', 'OPEN')
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'No active register session found to close.',
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Calculate expected cash balance
            // Expected = Opening Cash + Cash sales (completed & paid in cash) + Cash Movements IN - Cash Movements OUT
            $cashSales = DB::table('payments')
                ->join('orders', 'payments.order_id', '=', 'orders.id')
                ->where('orders.restaurant_id', $restaurantId)
                ->where('payments.payment_method', 'CASH')
                ->where('payments.status', 'PAID')
                ->where('payments.paid_at', '>=', $session->opened_at)
                ->sum('payments.amount');

            $cashInMovements = CashMovement::where('cash_session_id', $session->id)
                ->where('type', 'CASH_IN')
                ->sum('amount');

            $cashOutMovements = CashMovement::where('cash_session_id', $session->id)
                ->where('type', 'CASH_OUT')
                ->sum('amount');

            $expectedCash = $session->opening_cash + $cashSales + $cashInMovements - $cashOutMovements;
            $actualCash = $request->closing_cash_actual;
            $difference = $actualCash - $expectedCash;

            $session->update([
                'status' => 'CLOSED',
                'closed_by_user_id' => $user->id,
                'closed_at' => now(),
                'closing_cash_expected' => $expectedCash,
                'closing_cash_actual' => $actualCash,
                'difference' => $difference,
            ]);

            AuditLog::create([
                'restaurant_id' => $restaurantId,
                'user_id' => $user->id,
                'action' => 'CLOSE_CASH_SESSION',
                'entity' => 'cash_sessions',
                'entity_id' => $session->id,
                'metadata' => [
                    'expected' => $expectedCash,
                    'actual' => $actualCash,
                    'variance' => $difference
                ],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cash register drawer closed and audited.',
                'summary' => [
                    'opening_cash' => (float) $session->opening_cash,
                    'expected_sales' => (float) $cashSales,
                    'expected_total' => (float) $expectedCash,
                    'actual_total' => (float) $actualCash,
                    'variance' => (float) $difference,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Close transaction aborted: ' . $e->getMessage(),
            ], 500);
        }
    }
}
