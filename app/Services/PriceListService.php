<?php

namespace App\Services;

use App\Models\PriceList;
use Illuminate\Database\Eloquent\Collection;

class PriceListService
{
    public function listActive(): Collection
    {
        return PriceList::where('active', true)->get();
    }
}
