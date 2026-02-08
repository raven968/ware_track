<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function list(): LengthAwarePaginator
    {
        $query = Customer::with('user');

        if (request()->has('search')) {
            $query->search(request('search'));
        }

        return $query->latest()->paginate(15);
    }

    public function create(array $data): Customer
    {
        return Customer::create($data);
    }

    public function update(Customer $customer, array $data): Customer
    {
        $customer->update($data);
        return $customer;
    }

    public function delete(Customer $customer): void
    {
        $customer->delete();
    }
}
