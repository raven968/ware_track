import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from "sonner";
import { handleApiError } from '@/lib/errorHandler';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import ProductForm from '@/components/products/ProductForm';

export default function ProductList() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceLists, setPriceLists] = useState([]);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/products?page=${page}`);
      setPagination(response.data);
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceLists = async () => {
    try {
        const response = await api.get('/price-lists');
        setPriceLists(response.data);
    } catch (error) {
        console.error("Error fetching price lists:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPriceLists();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
        fetchProducts(newPage);
    }
  };

  const handleOpenCreate = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('products.delete_confirm'))) return;

    try {
        await api.delete(`/products/${id}`);
        toast.success(t('products.delete_success'));
        fetchProducts(pagination.current_page);
    } catch (error) {
        handleApiError(error, t('products.delete_error'));
    }
  };

  const handleSave = async (data) => {
    setIsSubmitting(true);
    try {
        if (currentProduct) {
            await api.put(`/products/${currentProduct.id}`, data);
        } else {
            await api.post('/products', data);
        }
        toast.success(t('products.save_success'));
        setIsModalOpen(false);
        fetchProducts(pagination.current_page);
    } catch (error) {
        handleApiError(error, t('products.save_error'));
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('products.title')}
        </h1>
        <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('products.add')}
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('products.table.name')}</TableHead>
              <TableHead>{t('products.table.sku')}</TableHead>
              <TableHead>{t('products.table.barcode')}</TableHead>
              <TableHead className="text-right">{t('products.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-gray-500">
                        Loading...
                    </TableCell>
                </TableRow>
            ) : products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-gray-500">
                        No products found.
                    </TableCell>
                </TableRow>
            ) : (
                products.map((product) => (
                <TableRow key={product.id}>
                    <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                    <TableCell className="text-gray-500">{product.sku}</TableCell>
                    <TableCell className="text-gray-500">{product.barcode || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page <= 1}
            >
            <ChevronLeft className="h-4 w-4" />
            Previous
            </Button>
            <div className="text-sm font-medium text-gray-600">
                Page {pagination.current_page} of {pagination.last_page}
            </div>
            <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page >= pagination.last_page}
            >
            Next
            <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {currentProduct ? t('products.form.title_edit') : t('products.form.title_add')}
                </DialogTitle>
            </DialogHeader>
            <ProductForm 
                product={currentProduct} 
                priceLists={priceLists}
                onSubmit={handleSave} 
                onCancel={() => setIsModalOpen(false)}
                isSubmitting={isSubmitting}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
