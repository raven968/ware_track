import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/axios";
import { handleApiError } from "@/lib/errorHandler";
import { toast } from "sonner";
import { Loader2, Plus, Minus } from "lucide-react";

export function StockModal({ isOpen, onClose, product }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  
  // Form State
  const [quantity, setQuantity] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
        fetchProductDetails();
    }
  }, [isOpen, product]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
        const [warehousesRes, productRes] = await Promise.all([
            api.get('/warehouses'),
            api.get(`/products/${product.id}`)
        ]);

        const allWarehouses = warehousesRes.data || [];
        const productWarehouses = productRes.data.warehouses || [];

        // Merge: Use all active warehouses, attach stock if available
        const mergedWarehouses = allWarehouses
            .filter(wh => wh.active) // Only show active warehouses
            .map(wh => {
                const productEntry = productWarehouses.find(pw => pw.id === wh.id);
                return {
                    ...wh,
                    pivot: {
                        stock: productEntry?.pivot?.stock || 0
                    }
                };
            });

        setWarehouses(mergedWarehouses);
    } catch (error) {
        handleApiError(error, t('common.error_loading_data'));
    } finally {
        setLoading(false);
    }
  };

  const handleStockAdjustment = async (type) => { // 'add' or 'remove'
    if (!selectedWarehouseId || !quantity || !comment) {
        toast.error(t('stock.validation_required'));
        return;
    }

    setIsSubmitting(true);
    try {
        const endpoint = type === 'add' ? '/inventory/add-stock' : '/inventory/remove-stock';
        await api.post(endpoint, {
            product_id: product.id,
            warehouse_id: selectedWarehouseId,
            quantity: parseInt(quantity),
            comment: comment
        });

        toast.success(type === 'add' ? t('stock.added_success') : t('stock.removed_success'));
        
        // Reset form and refresh data
        setQuantity("");
        setComment("");
        fetchProductDetails();
    } catch (error) {
        handleApiError(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('stock.manage_title')}: {product?.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Col: Warehouse List & Current Stock */}
            <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-3">{t('stock.current_stock')}</h3>
                {loading ? (
                    <div className="text-center py-4"><Loader2 className="animate-spin mx-auto" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('warehouses.table.name')}</TableHead>
                                <TableHead className="text-right">{t('products.table.stock')}</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {warehouses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">{t('common.no_results')}</TableCell>
                                </TableRow>
                            ) : (
                                warehouses.map(wh => (
                                    <TableRow 
                                        key={wh.id} 
                                        className={`cursor-pointer ${selectedWarehouseId === wh.id ? "bg-muted" : ""}`}
                                        onClick={() => setSelectedWarehouseId(wh.id)}
                                    >
                                        <TableCell>{wh.name}</TableCell>
                                        <TableCell className="text-right font-medium">{wh.pivot?.stock || 0}</TableCell>
                                        <TableCell>
                                            {selectedWarehouseId === wh.id && <div className="w-2 h-2 bg-primary rounded-full mx-auto" />}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Right Col: Action Form */}
            <div className="border rounded-md p-4 space-y-4">
                <h3 className="font-semibold">{t('stock.adjust_title')}</h3>
                
                {!selectedWarehouseId ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                        {t('stock.select_warehouse_prompt')}
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label>{t('stock.quantity')}</Label>
                            <Input 
                                type="number" 
                                min="1" 
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)} 
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('stock.comment')} ({t('common.required')})</Label>
                            <Textarea 
                                value={comment} 
                                onChange={(e) => setComment(e.target.value)} 
                                placeholder={t('stock.comment_placeholder')}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <Button 
                                variant="outline" 
                                className="border-red-200 hover:bg-red-50 text-red-700"
                                onClick={() => handleStockAdjustment('remove')}
                                disabled={isSubmitting}
                            >
                                <Minus className="mr-2 h-4 w-4" /> {t('stock.remove')}
                            </Button>
                            <Button 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleStockAdjustment('add')}
                                disabled={isSubmitting}
                            >
                                <Plus className="mr-2 h-4 w-4" /> {t('stock.add')}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
