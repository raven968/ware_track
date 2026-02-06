import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export default function WarehouseForm({ warehouse, onSubmit, onCancel, isSubmitting }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    active: true
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        location: warehouse.location || '',
        active: warehouse.active !== undefined ? Boolean(warehouse.active) : true
      });
    } else {
        setFormData({ name: '', location: '', active: true });
    }
  }, [warehouse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckedChange = (checked) => {
      setFormData(prev => ({ ...prev, active: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('warehouses.form.name')}</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">{t('warehouses.form.location')}</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
            id="active" 
            checked={formData.active}
            onCheckedChange={handleCheckedChange}
        />
        <Label htmlFor="active" className="cursor-pointer">
            {t('warehouses.form.active')}
        </Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t('warehouses.form.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('warehouses.form.save')}
        </Button>
      </div>
    </form>
  );
}
