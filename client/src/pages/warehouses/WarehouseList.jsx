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
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import WarehouseForm from '@/components/warehouses/WarehouseForm';

export default function WarehouseList() {
  const { t } = useTranslation();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      handleApiError(error, t('common.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenCreate = () => {
    setCurrentWarehouse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (warehouse) => {
    setCurrentWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('warehouses.delete_confirm'))) return;

    try {
        await api.delete(`/warehouses/${id}`);
        toast.success(t('warehouses.delete_success'));
        fetchWarehouses();
    } catch (error) {
        handleApiError(error, t('warehouses.delete_error'));
    }
  };

  const handleSave = async (data) => {
    setIsSubmitting(true);
    try {
        if (currentWarehouse) {
            await api.put(`/warehouses/${currentWarehouse.id}`, data);
        } else {
            await api.post('/warehouses', data);
        }
        toast.success(t('warehouses.save_success'));
        setIsModalOpen(false);
        fetchWarehouses();
    } catch (error) {
        handleApiError(error, t('warehouses.save_error'));
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('warehouses.title')}
        </h1>
        <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('warehouses.add')}
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('warehouses.table.name')}</TableHead>
              <TableHead>{t('warehouses.table.location')}</TableHead>
              <TableHead className="w-[100px] text-center">{t('warehouses.table.status')}</TableHead>
              <TableHead className="text-right">{t('warehouses.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-gray-500">
                        {t('common.loading')}
                    </TableCell>
                </TableRow>
            ) : warehouses.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-gray-500">
                        {t('common.no_results')}
                    </TableCell>
                </TableRow>
            ) : (
                warehouses.map((wh) => (
                <TableRow key={wh.id}>
                    <TableCell className="font-medium text-gray-900">{wh.name}</TableCell>
                    <TableCell className="text-gray-500">{wh.location || '-'}</TableCell>
                    <TableCell className="text-center">
                        {wh.active ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                            <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(wh)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(wh.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {currentWarehouse ? t('warehouses.form.title_edit') : t('warehouses.form.title_add')}
                </DialogTitle>
            </DialogHeader>
            <WarehouseForm 
                warehouse={currentWarehouse} 
                onSubmit={handleSave} 
                onCancel={() => setIsModalOpen(false)}
                isSubmitting={isSubmitting}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
