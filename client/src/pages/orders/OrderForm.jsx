import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AsyncSelect } from "@/components/ui/async-select";
import { Plus, Trash2, Save, ArrowLeft, Search } from "lucide-react";
import { handleApiError } from '@/lib/errorHandler';
import { toast } from "sonner";
import { ProductSelectorModal } from '@/components/orders/ProductSelectorModal';

export default function OrderForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Data State
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  // const [products, setProducts] = useState([]); // Removed, handled by modal
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customer_id: '',
    warehouse_id: '',
    price_list_id: '',
    notes: '',
    items: [] // { product_id, quantity, unit_price, total, product_name }
  });

  // Calculate Totals
  const subtotal = formData.items.reduce((acc, item) => acc + (parseFloat(item.total) || 0), 0);
  const tax = 0; // Implement logic if needed
  const grandTotal = subtotal + tax;

  // Initial Fetch
  useEffect(() => {
    Promise.all([
        api.get('/customers'),
        api.get('/warehouses'),
        api.get('/price-lists'),
        // api.get('/products') // Removed
    ]).then(([resCust, resWare, resPL]) => {
        setCustomers(resCust.data.data || resCust.data);
        setWarehouses(resWare.data);
        setPriceLists(resPL.data);
        setLoadingInitial(false);
    }).catch(err => {
        handleApiError(err, "Failed to load form data");
        setLoadingInitial(false);
    });
  }, []);

  // Handlers
  const handleHeaderChange = (name, value) => {
    setFormData(prev => {
        const newData = { ...prev, [name]: value };
        
        // If price list changes, verify all items and update their prices
        if (name === 'price_list_id') {
             newData.items = prev.items.map(item => {
                 let newPrice = parseFloat(item.base_price || 0);
                 const targetListId = parseInt(value);
                 
                 if (item.price_lists) {
                     const priceListEntry = item.price_lists.find(pl => pl.id === targetListId);
                     if (priceListEntry && priceListEntry.pivot && priceListEntry.pivot.price) {
                         newPrice = parseFloat(priceListEntry.pivot.price);
                     }
                 }
                 
                 return {
                     ...item,
                     unit_price: newPrice,
                     total: item.quantity * newPrice
                 };
             });
        }
        
        return newData;
    });
  };

  const addItem = () => {
    if (!formData.price_list_id) {
        toast.error(t('orders.form.validation_price_list_required') || "Please select a price list first.");
        return;
    }
    setActiveItemIndex(null); // Indicates new item
    setIsProductModalOpen(true);
  };

  const removeItem = (index) => {
    setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const openProductModal = (index) => {
    setActiveItemIndex(index);
    setIsProductModalOpen(true);
  };

  const handleProductSelect = (product) => {
    const isNewItem = activeItemIndex === null;

    setFormData(prev => {
        const newItems = [...prev.items];
        // If it's a new item, start with a fresh object. Otherwise copy existing.
        let item = isNewItem 
            ? { product_id: '', quantity: 1, unit_price: 0, total: 0, product_name: '' }
            : { ...newItems[activeItemIndex] };

        item.product_id = product.id;
        item.product_name = product.name;
        
        // Store metadata for future updates
        item.base_price = parseFloat(product.price || 0);
        item.price_lists = product.price_lists || [];

        // Find price based on selected price list
        let selectedPrice = item.base_price;

        if (prev.price_list_id && product.price_lists) {
            // IDs from select might be string, backend IDs are number. Ensure type safety.
            const targetListId = parseInt(prev.price_list_id);
            const priceListEntry = product.price_lists.find(pl => pl.id === targetListId);
            
            if (priceListEntry && priceListEntry.pivot && priceListEntry.pivot.price) {
                selectedPrice = parseFloat(priceListEntry.pivot.price);
            }
        }

        item.unit_price = selectedPrice;
        item.total = item.quantity * selectedPrice; // Use selectedPrice here directly

        if (isNewItem) {
            newItems.push(item);
        } else {
            newItems[activeItemIndex] = item;
        }

        return { ...prev, items: newItems };
    });
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
        const newItems = [...prev.items];
        const item = { ...newItems[index] };

        if (field === 'quantity') {
            item.quantity = parseFloat(value) || 0;
        }
        else if (field === 'unit_price') {
             item.unit_price = parseFloat(value) || 0;
        }

        // Recalculate line total
        item.total = item.quantity * item.unit_price;
        newItems[index] = item;
        return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Basic Validation
    if (!formData.customer_id || !formData.warehouse_id || !formData.price_list_id) {
        toast.error(t('orders.form.validation_header'));
        setIsSubmitting(false);
        return;
    }
    if (formData.items.length === 0) {
        toast.error(t('orders.form.validation_items'));
        setIsSubmitting(false);
        return;
    }
    // Validate all items have products
    const invalidItems = formData.items.some(item => !item.product_id);
    if (invalidItems) {
        toast.error(t('orders.form.validation_items_products') || "All items must have a selected product.");
        setIsSubmitting(false);
        return;
    }

    try {
        await api.post('/orders', formData);
        toast.success(t('orders.save_success'));
        navigate('/orders');
    } catch (error) {
        handleApiError(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loadingInitial) return <div className="p-10 text-center">{t('common.loading')}</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('orders.create')}</h1>
        <Button variant="ghost" onClick={() => navigate('/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label>{t('orders.form.customer')}</Label>
                <AsyncSelect 
                    options={customers} 
                    value={formData.customer_id}
                    onValueChange={(val) => handleHeaderChange('customer_id', val)}
                    itemValue="id"
                    itemLabel="name"
                    placeholder={t('orders.form.select_customer')}
                />
            </div>
            <div className="space-y-2">
                <Label>{t('orders.form.warehouse')}</Label>
                <AsyncSelect 
                    options={warehouses} 
                    value={formData.warehouse_id}
                    onValueChange={(val) => handleHeaderChange('warehouse_id', val)}
                    itemValue="id"
                    itemLabel="name"
                    placeholder={t('orders.form.select_warehouse')}
                />
            </div>
            <div className="space-y-2">
                <Label>{t('orders.form.price_list')}</Label>
                <AsyncSelect 
                    options={priceLists} 
                    value={formData.price_list_id}
                    onValueChange={(val) => handleHeaderChange('price_list_id', val)}
                    itemValue="id"
                    itemLabel="name"
                    placeholder={t('orders.form.select_price_list')}
                />
            </div>
             <div className="col-span-full space-y-2">
                <Label>{t('orders.form.notes')}</Label>
                <Textarea 
                    value={formData.notes}
                    onChange={(e) => handleHeaderChange('notes', e.target.value)}
                    placeholder={t('orders.form.notes_placeholder')}
                />
            </div>
        </div>

        {/* Items Section */}
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{t('orders.form.items_title')}</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" /> {t('orders.form.add_item')}
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">{t('orders.form.product')}</TableHead>
                        <TableHead className="w-[15%]">{t('orders.form.quantity')}</TableHead>
                        <TableHead className="w-[15%]">{t('orders.form.unit_price')}</TableHead>
                        <TableHead className="w-[15%] text-right">{t('orders.form.line_total')}</TableHead>
                        <TableHead className="w-[5%]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {formData.items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                {item.product_name ? (
                                    <div className="flex items-center justify-between border p-2 rounded-md">
                                        <span className="font-medium">{item.product_name}</span>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => openProductModal(index)}>
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button type="button" variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => openProductModal(index)}>
                                        <Search className="mr-2 h-4 w-4" />
                                        {t('orders.form.select_product')}
                                    </Button>
                                )}
                            </TableCell>
                            <TableCell>
                                <Input 
                                    type="number" 
                                    min="1" 
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background text-muted-foreground cursor-not-allowed">
                                    {item.unit_price?.toFixed(2)}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                ${item.total.toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-500"
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {formData.items.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                {t('orders.form.no_items')}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Footer Totals */}
            <div className="flex justify-end pt-4 border-t">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>{t('orders.form.subtotal')}:</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-sm text-gray-500">
                        <span>{t('orders.form.tax')} (0%):</span>
                        <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>{t('orders.form.total')}:</span>
                        <span>${grandTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> 
                {isSubmitting ? t('orders.form.saving') : t('orders.form.save')}
            </Button>
        </div>
      </form>
      
      <ProductSelectorModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelect={handleProductSelect}
        priceListId={formData.price_list_id}
      />
    </div>
  );
}
