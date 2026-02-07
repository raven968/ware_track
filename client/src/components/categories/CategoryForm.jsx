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
import { AsyncSelect } from "@/components/ui/async-select";

export function CategoryForm({ isOpen, onClose, categoryToEdit, onSuccess }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    parent_id: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (isOpen) {
        fetchCategories();
      if (categoryToEdit) {
        setFormData({
            name: categoryToEdit.name,
            parent_id: categoryToEdit.parent_id
        });
      } else {
        setFormData({
          name: '',
          parent_id: null
        });
      }
    }
  }, [isOpen, categoryToEdit]);

  const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
          const response = await api.get('/categories?per_page=100'); // Fetch all (limit 100 for now)
          // Filter out the category itself if editing to prevent cycles
          let cats = response.data.data;
          if (categoryToEdit) {
              cats = cats.filter(c => c.id !== categoryToEdit.id);
          }
          setCategories(cats);
      } catch (error) {
          console.error("Failed to load categories", error);
      } finally {
          setLoadingCategories(false);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
        name: formData.name,
        parent_id: formData.parent_id
    };

    try {
      if (categoryToEdit) {
        await api.put(`/categories/${categoryToEdit.id}`, payload);
        toast.success(t('categories.save_success'));
      } else {
        await api.post('/categories', payload);
        toast.success(t('categories.save_success'));
      }
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error, t('categories.save_error'));
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {categoryToEdit ? t('categories.form.title_edit') : t('categories.form.title_add')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('categories.form.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('categories.form.parent')}</Label>
            <AsyncSelect
                options={categories}
                value={formData.parent_id}
                onValueChange={(val) => setFormData({ ...formData, parent_id: val })}
                itemValue="id"
                itemLabel="name"
                placeholder={t('common.select')}
                isLoading={loadingCategories}
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
