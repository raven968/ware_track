import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleApiError } from '@/lib/errorHandler';
import { toast } from "sonner";

export function CustomerForm({ isOpen, onClose, customerToEdit, onSuccess }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (customerToEdit) {
        setFormData({
          name: customerToEdit.name,
          email: customerToEdit.email || '',
          phone: customerToEdit.phone || '',
          address: customerToEdit.address || ''
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: ''
        });
      }
    }
  }, [isOpen, customerToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (customerToEdit) {
        await api.put(`/customers/${customerToEdit.id}`, formData);
        toast.success(t('customers.save_success') || "Customer saved successfully");
      } else {
        await api.post('/customers', formData);
        toast.success(t('customers.save_success') || "Customer created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error, t('customers.save_error'));
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {customerToEdit ? t('customers.form.title_edit') : t('customers.form.title_add')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('customers.form.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('customers.form.email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t('customers.form.phone')}</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t('customers.form.address')}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
