<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CashSession extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'restaurant_id',
        'opened_by_user_id',
        'closed_by_user_id',
        'opened_at',
        'closed_at',
        'opening_cash',
        'closing_cash_expected',
        'closing_cash_actual',
        'difference',
        'status',
    ];

    protected $casts = [
        'opening_cash' => 'decimal:2',
        'closing_cash_expected' => 'decimal:2',
        'closing_cash_actual' => 'decimal:2',
        'difference' => 'decimal:2',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function openedBy()
    {
        return $this->belongsTo(User::class, 'opened_by_user_id');
    }

    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by_user_id');
    }

    public function movements()
    {
        return $this->hasMany(CashMovement::class);
    }
}
