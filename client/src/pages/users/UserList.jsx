import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from "sonner";
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
import UserForm from '@/components/users/UserForm';

export default function UserList() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/users?page=${page}`);
      setPagination(response.data);
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
        fetchUsers(newPage);
    }
  };

  const handleOpenCreate = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('users.delete_confirm'))) return;

    try {
        await api.delete(`/users/${id}`);
        toast.success(t('users.delete_success'));
        fetchUsers(pagination.current_page);
    } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(t('users.delete_error'));
    }
  };

  const handleSave = async (data) => {
    setIsSubmitting(true);
    try {
        if (currentUser) {
            await api.put(`/users/${currentUser.id}`, data);
        } else {
            await api.post('/users', data);
        }
        toast.success(t('users.save_success'));
        setIsModalOpen(false);
        fetchUsers(pagination.current_page);
    } catch (error) {
        console.error("Error saving user:", error);
        toast.error(t('users.save_error'));
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('users.title')}
        </h1>
        <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('users.add')}
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('users.table.name')}</TableHead>
              <TableHead>{t('users.table.email')}</TableHead>
              <TableHead>{t('users.table.role')}</TableHead>
              <TableHead className="text-right">{t('users.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-gray-500">
                        Loading...
                    </TableCell>
                </TableRow>
            ) : users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-gray-500">
                        No users found.
                    </TableCell>
                </TableRow>
            ) : (
                users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                    <TableCell className="text-gray-500">{user.email}</TableCell>
                    <TableCell className="text-gray-500">
                      {user.roles && user.roles.length > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {user.roles[0].title || user.roles[0].name}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
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
                    {currentUser ? t('users.form.title_edit') : t('users.form.title_add')}
                </DialogTitle>
            </DialogHeader>
            <UserForm 
                user={currentUser} 
                onSubmit={handleSave} 
                onCancel={() => setIsModalOpen(false)}
                isSubmitting={isSubmitting}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
