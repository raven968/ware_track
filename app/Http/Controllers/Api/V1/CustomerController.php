<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\StoreCustomerRequest;
use App\Http\Requests\Customers\UpdateCustomerRequest;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Spatie\RouteAttributes\Attributes\{Delete, Get, Middleware, Post, Prefix, Put};

#[Prefix('customers')]
#[Middleware('auth:sanctum')]
class CustomerController extends Controller
{
    public function __construct(
        protected CustomerService $service
    ) {}

    #[Get('/')]
    #[Middleware('can:view-customers')]
    public function index(): JsonResponse
    {
        return response()->json($this->service->list());
    }

    #[Post('/')]
    #[Middleware('can:create-customers')]
    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = $this->service->create($request->validated());

        return response()->json([
            'message' => __('messages.customer_created'),
            'data' => $customer,
        ], 201);
    }

    #[Get('{customer}')]
    #[Middleware('can:view-customers')]
    public function show(Customer $customer): JsonResponse
    {
        return response()->json($customer->load('user'));
    }

    #[Put('{customer}')]
    #[Middleware('can:update-customers')]
    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $updatedCustomer = $this->service->update($customer, $request->validated());

        return response()->json([
            'message' => __('messages.customer_updated'),
            'data' => $updatedCustomer,
        ]);
    }

    #[Delete('{customer}')]
    #[Middleware('can:delete-customers')]
    public function destroy(Customer $customer): JsonResponse
    {
        $this->service->delete($customer);

        return response()->json(null, 204);
    }
}
