import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { handleApiError } from '@/lib/errorHandler';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CustomerList() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  
  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers', {
        params: { page, search }
      });
      // Handle pagination structure
      if (response.data.data) {
          setCustomers(response.data.data);
          setTotalPages(response.data.last_page);
      } else {
          setCustomers(response.data);
      }
    } catch (error) {
      handleApiError(error, t('common.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const handleCreate = () => {
    setCustomerToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (customer) => {
    setCustomerToEdit(customer);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/customers/${deleteId}`);
      toast.success(t('customers.delete_success') || "Customer deleted successfully");
      fetchCustomers();
    } catch (error) {
       handleApiError(error, t('customers.delete_error'));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('sidebar.customers')}</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> {t('customers.add')}
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-white p-4 rounded-lg shadow-sm border">
        <Search className="h-5 w-5 text-gray-500" />
        <Input 
          placeholder={t('products.select_modal.search_placeholder') || "Search..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-none shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('customers.form.name')}</TableHead>
              <TableHead>{t('customers.form.email')}</TableHead>
              <TableHead>{t('customers.form.phone')}</TableHead>
               <TableHead>{t('customers.form.address')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="h-24 text-center">
                   <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                 </TableCell>
               </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {t('common.no_results')}
                </TableCell>
              </TableRow>
            ) : (
                customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                   <TableCell>{customer.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                            <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(customer.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

         {/* Pagination Controls */}
         <div className="flex items-center justify-end space-x-2 p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t('common.previous')}
            </Button>
            <div className="text-sm">
                {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {t('common.next')}
            </Button>
          </div>
      </div>

      <CustomerForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        customerToEdit={customerToEdit}
        onSuccess={fetchCustomers}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customers.delete_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
                Are you sure you want to delete this customer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
