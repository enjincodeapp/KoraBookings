<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Space extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'description',
        'capacity',
        'price_per_hour',
        'price_per_year',
        'area',
        'owner',
        'contact_info',
        'rating',
        'review_count',
        'amenities',
        'images',
        'address',
        'latitude',
        'longitude',
        'available',
        'beds',
        'bathrooms',
        'reviews',
        'price_per_night',
    ];

    protected $casts = [
        'price_per_hour' => 'decimal:2',
        'price_per_night' => 'decimal:2',
        'price_per_year' => 'decimal:2',
        'rating' => 'decimal:1',
        'capacity' => 'integer',
        'beds' => 'integer',
        'bathrooms' => 'integer',
        'review_count' => 'integer',
        'available' => 'boolean',
        'amenities' => 'array',
        'images' => 'array',
        'reviews' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
