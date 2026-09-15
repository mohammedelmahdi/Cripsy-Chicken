<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ModifierGroup extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'restaurant_id',
        'name',
        'min_selections',
        'max_selections',
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

    public function options()
    {
        return $this->hasMany(ModifierOption::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_modifier_groups');
    }
}
