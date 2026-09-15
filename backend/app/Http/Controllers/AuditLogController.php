<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $logs = AuditLog::where('restaurant_id', $restaurantId)
            ->with('user')
            ->orderBy('id', 'desc') // UUIDs or custom ordering, using standard temporal sort if created_at is available, fallback to id/uuid
            ->take(200)
            ->get();

        return response()->json($logs);
    }
}
