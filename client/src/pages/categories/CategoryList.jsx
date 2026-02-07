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
import { Plus, Search, Edit, Trash2, Loader2, FolderTree } from "lucide-react";
import { CategoryForm } from "@/components/categories/CategoryForm";
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

export default function CategoryList() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  
  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories', {
        params: { page, search }
      });
      if (response.data.data) {
          setCategories(response.data.data);
          setTotalPages(response.data.last_page);
      } else {
          setCategories(response.data);
      }
    } catch (error) {
      handleApiError(error, t('common.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const handleCreate = () => {
    setCategoryToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category) => {
    setCategoryToEdit(category);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/categories/${deleteId}`);
      toast.success(t('categories.delete_success') || "Category deleted successfully");
      fetchCategories();
    } catch (error) {
       handleApiError(error, t('categories.delete_error'));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('categories.title')}</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> {t('categories.add')}
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
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>{t('categories.form.name')}</TableHead>
              <TableHead>{t('categories.form.parent')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={4} className="h-24 text-center">
                   <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                 </TableCell>
               </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {t('common.no_results')}
                </TableCell>
              </TableRow>
            ) : (
                categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <FolderTree className="h-4 w-4 text-gray-400" />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-gray-500">
                    {category.parent ? category.parent.name : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                            <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(category.id)}>
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

      <CategoryForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categoryToEdit={categoryToEdit}
        onSuccess={fetchCategories}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('categories.delete_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
                Are you sure you want to delete this category? Subcategories might become orphaned or deleted depending on logic.
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
