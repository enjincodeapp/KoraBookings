<?php

namespace App\Http\Controllers;

use App\Models\Space;
use Illuminate\Http\Request;

class SpaceController extends Controller
{
    public function index(Request $request)
    {
        $queryText = trim($request->query('search', ''));
        $area = trim($request->query('area', ''));
        $type = trim($request->query('type', ''));
        $minPrice = $request->query('min_price');
        $maxPrice = $request->query('max_price');
        $available = $request->query('available');
        $rating = $request->query('rating');
        $sort = $request->query('sort', 'newest');
        $perPage = intval($request->query('per_page', 12));
        $perPage = max(1, $perPage);

        $spaces = Space::query();

        if ($queryText) {
            $spaces->where(function ($q) use ($queryText) {
                $q->where('name', 'like', "%{$queryText}%")
                    ->orWhere('description', 'like', "%{$queryText}%")
                    ->orWhere('area', 'like', "%{$queryText}%")
                    ->orWhere('type', 'like', "%{$queryText}%");
            });
        }

        if ($area) {
            $areas = is_array($area) ? $area : explode(',', $area);
            $spaces->where(function ($q) use ($areas) {
                foreach ($areas as $a) {
                    $q->orWhere('area', 'like', "%" . trim($a) . "%");
                }
            });
        }

        if ($type) {
            $spaces->where('type', 'like', "%{$type}%");
        }

        if ($minPrice !== null && $minPrice !== '') {
            $spaces->where(function ($q) use ($minPrice) {
                $q->where('price_per_year', '>=', floatval($minPrice))
                  ->orWhere('price_per_hour', '>=', floatval($minPrice));
            });
        }

        if ($maxPrice !== null && $maxPrice !== '') {
            $spaces->where(function ($q) use ($maxPrice) {
                $q->where('price_per_year', '<=', floatval($maxPrice))
                  ->orWhere('price_per_hour', '<=', floatval($maxPrice));
            });
        }

        if ($available !== null && $available !== '') {
            $spaces->where('available', boolval($available));
        }

        if ($rating !== null && $rating !== '') {
            $spaces->where('rating', '>=', floatval($rating));
        }

        switch ($sort) {
            case 'price_low_high':
                $spaces->orderByRaw('COALESCE(price_per_year, price_per_hour) asc');
                break;
            case 'price_high_low':
                $spaces->orderByRaw('COALESCE(price_per_year, price_per_hour) desc');
                break;
            case 'highest_rated':
                $spaces->orderBy('rating', 'desc');
                break;
            default:
                $spaces->orderBy('created_at', 'desc');
                break;
        }

        return response()->json($spaces->paginate($perPage));
    }

    public function show($id)
    {
        $space = Space::findOrFail($id);
        return response()->json($space);
    }

    public function trendingAsokoro()
    {
        $spaces = Space::where('area', 'Asokoro')->get();
        return response()->json($spaces);
    }

    public function trendingWuse()
    {
        $spaces = Space::where('area', 'Wuse')->get();
        return response()->json($spaces);
    }

    public function aiRecommended()
    {
        $spaces = Space::inRandomOrder()->take(3)->get();
        return response()->json($spaces);
    }

    public function aiSearch(Request $request)
    {
        $query = trim($request->query('query', ''));

        if (!$query) {
            return response()->json([]);
        }

        $normalized = strtolower($query);
        $areaKeywords = ['asokoro', 'maitama', 'wuse', 'garki', 'jabi', 'utako', 'central business district', 'cbd', 'lugbe', 'kado', 'durumi', 'apo', 'kubwa', 'karmo', 'karu', 'bwari', 'kwali'];
        $typeKeywords = ['apartment', 'luxury stay', 'luxury_stay', 'studio', 'penthouse', 'villa', 'condo', 'flat'];
        $amenityKeywords = ['wifi', 'high-speed internet', 'pool', 'gym', 'parking', 'breakfast', 'restaurant', 'pet friendly', 'spa'];

        $areaFilter = null;
        foreach ($areaKeywords as $area) {
            if (str_contains($normalized, $area)) {
                $areaFilter = ucfirst($area);
                if ($area === 'cbd') {
                    $areaFilter = 'Central Business District (CBD)';
                }
                break;
            }
        }

        $typeFilter = null;
        foreach ($typeKeywords as $type) {
            if (str_contains($normalized, $type)) {
                $typeFilter = str_replace(' ', '_', $type);
                break;
            }
        }

        $minPrice = null;
        $maxPrice = null;
        if (preg_match('/(?:under|below|less than)\s*₦?([0-9,]+)/i', $query, $matches)) {
            $maxPrice = intval(str_replace(',', '', $matches[1]));
        }
        if (preg_match('/(?:over|above|more than|at least)\s*₦?([0-9,]+)/i', $query, $matches)) {
            $minPrice = intval(str_replace(',', '', $matches[1]));
        }
        if (preg_match('/₦?([0-9,]+)\s*(?:to|-|–)\s*₦?([0-9,]+)/', $query, $matches)) {
            $minPrice = intval(str_replace(',', '', $matches[1]));
            $maxPrice = intval(str_replace(',', '', $matches[2]));
        }

        $spaces = Space::query();

        if ($areaFilter) {
            $spaces->where('area', 'like', "%{$areaFilter}%");
        }

        if ($typeFilter) {
            $spaces->where('type', 'like', "%{$typeFilter}%");
        }

        if ($minPrice !== null) {
            $spaces->whereRaw('(price_per_year >= ? OR price_per_hour >= ?)', [$minPrice, $minPrice]);
        }

        if ($maxPrice !== null) {
            $spaces->whereRaw('(price_per_year <= ? OR price_per_hour <= ?)', [$maxPrice, $maxPrice]);
        }

        $spaces->where(function ($queryBuilder) use ($query, $amenityKeywords) {
            $queryBuilder->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->orWhere('area', 'like', "%{$query}%")
                ->orWhere('type', 'like', "%{$query}%");

            foreach ($amenityKeywords as $amenity) {
                if (str_contains(strtolower($query), $amenity)) {
                    $queryBuilder->orWhereJsonContains('amenities', $amenity);
                }
            }
        });

        $results = $spaces->take(12)->get();
        return response()->json($results);
    }

    public function bestValue()
    {
        $spaces = Space::where('area', 'Asokoro')->get();
        return response()->json($spaces);
    }
}
