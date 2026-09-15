<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'restaurant_id',
        'category_id',
        'name',
        'description',
        'is_active',
        'track_stock',
        'current_stock',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'track_stock' => 'boolean',
        'current_stock' => 'decimal:2',
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

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function prices()
    {
        return $this->hasMany(ProductPrice::class);
    }

    public function modifierGroups()
    {
        return $this->belongsToMany(ModifierGroup::class, 'product_modifier_groups');
    }

    public function recipe()
    {
        return $this->hasOne(Recipe::class);
    }
}
