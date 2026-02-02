import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";


export default function ProductForm({ product, priceLists, onSubmit, onCancel, isSubmitting }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    prices: {} // { price_list_id: price }
  });

  useEffect(() => {
    if (product) {
        // Map existing prices to state
        const initialPrices = {};
        if (product.price_lists) {
            product.price_lists.forEach(pl => {
                initialPrices[pl.id] = pl.pivot.price;
            });
        }
        
        setFormData({
            name: product.name || '',
            sku: product.sku || '',
            barcode: product.barcode || '',
            description: product.description || '',
            prices: initialPrices
        });
    } else {
        setFormData({
            name: '',
            sku: '',
            barcode: '',
            description: '',
            prices: {}
        });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (priceListId, value) => {
    setFormData(prev => ({
        ...prev,
        prices: {
            ...prev.prices,
            [priceListId]: value
        }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Transform prices object to array for backend
    const pricesArray = Object.entries(formData.prices).map(([id, price]) => ({
        price_list_id: parseInt(id),
        price: parseFloat(price)
    })).filter(p => p.price > 0); // only send valid prices

    onSubmit({ ...formData, prices: pricesArray });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="name">{t('products.form.name')}</Label>
        <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            placeholder="Ex: Wireless Mouse"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
            <Label htmlFor="sku">{t('products.form.sku')}</Label>
            <Input 
                id="sku" 
                name="sku" 
                value={formData.sku} 
                onChange={handleChange} 
                required 
                placeholder="Ex: WM-001"
            />
        </div>
        <div className="grid gap-1.5">
            <Label htmlFor="barcode">{t('products.form.barcode')}</Label>
            <Input 
                id="barcode" 
                name="barcode" 
                value={formData.barcode} 
                onChange={handleChange} 
                placeholder="Optional"
            />
        </div>
      </div>

      {/* Dynamic Price Lists */}
      {priceLists.length > 0 && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-md border">
            <h4 className="text-sm font-medium text-gray-700">{t('products.form.price_lists')}</h4>
            <div className="grid grid-cols-2 gap-3">
                {priceLists.map(pl => (
                    <div key={pl.id} className="grid gap-1.5">
                        <Label htmlFor={`pl_${pl.id}`} className="text-xs text-gray-500">{pl.name}</Label>
                        <Input 
                            id={`pl_${pl.id}`}
                            type="number"
                            step="0.01"
                            value={formData.prices[pl.id] || ''}
                            onChange={(e) => handlePriceChange(pl.id, e.target.value)}
                            placeholder="0.00"
                            className="h-8"
                        />
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="grid w-full gap-1.5">
        <Label htmlFor="description">{t('products.form.description')}</Label>
        <Input 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Optional detailed description"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
            {t('products.form.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : t('products.form.save')}
        </Button>
      </div>
    </form>
  );
}
