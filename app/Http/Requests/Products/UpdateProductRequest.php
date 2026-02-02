<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $product = $this->route('product');
        $id = $product ? $product->id : null;

        return [
            'name' => 'string|max:255',
            'sku' => 'string|unique:products,sku,' . $id,
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'barcode' => 'nullable|string',
            'min_stock' => 'integer|min:0',
            'active' => 'boolean',
        ];
    }
}
