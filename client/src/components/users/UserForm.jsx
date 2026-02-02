import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import api from '@/lib/axios';

export default function UserForm({ user, onSubmit, onCancel, isSubmitting }) {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  useEffect(() => {
    // Fetch roles
    api.get('/users/roles/list').then(res => {
        setRoles(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
        let currentRole = '';
        if (user.roles && user.roles.length > 0) {
            currentRole = user.roles[0].name;
        }

        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '', // Password is blank on edit
            role: currentRole,
        });
    } else {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: '',
        });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.password) {
        delete payload.password;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="name">{t('users.form.name')}</Label>
        <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
        />
      </div>

      <div className="grid w-full gap-1.5">
        <Label htmlFor="email">{t('users.form.email')}</Label>
        <Input 
            id="email" 
            name="email" 
            type="email"
            value={formData.email} 
            onChange={handleChange} 
            required 
        />
      </div>

      <div className="grid w-full gap-1.5">
        <Label htmlFor="password">{t('users.form.password')}</Label>
        <Input 
            id="password" 
            name="password" 
            type="password"
            value={formData.password} 
            onChange={handleChange} 
            required={!user} // Required only on create
            placeholder={user ? "Leave blank to keep current" : ""}
        />
      </div>

      <div className="grid w-full gap-1.5">
        <Label htmlFor="role">{t('users.form.role')}</Label>
        <Select onValueChange={handleRoleChange} value={formData.role} required>
            <SelectTrigger>
                <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
                {roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>{role.title || role.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
            {t('users.form.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : t('users.form.save')}
        </Button>
      </div>
    </form>
  );
}
