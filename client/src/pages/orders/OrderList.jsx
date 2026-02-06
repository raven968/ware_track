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
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { handleApiError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';

export default function OrderList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchOrders = () => {
    setLoading(true);
    api.get(`/orders?page=${page}`)
      .then(res => {
        setOrders(res.data.data);
        setLastPage(res.data.last_page);
      })
      .catch(err => {
        handleApiError(err, t('orders.list.error_loading'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleDelete = (id) => {
    if (confirm(t('orders.list.confirm_delete'))) {
      api.delete(`/orders/${id}`)
        .then(() => {
          fetchOrders();
        })
        .catch(err => handleApiError(err));
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('orders.list.title')}</h1>
        <Button onClick={() => navigate('/orders/new')}>
          <Plus className="mr-2 h-4 w-4" /> {t('orders.list.create')}
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{t('orders.list.customer')}</TableHead>
              <TableHead>{t('orders.list.date')}</TableHead>
              <TableHead>{t('orders.list.total')}</TableHead>
              <TableHead>{t('orders.list.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  {t('orders.list.no_results')}
                </TableCell>
              </TableRow>
            ) : (
                orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.customer ? order.customer.name : 'Unknown'}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>${parseFloat(order.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/orders/${order.id}/edit`)}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
        >
            <ChevronLeft className="mr-2 h-4 w-4" /> {t('common.previous')}
        </Button>
        <span className="text-sm text-gray-600">
            Page {page} of {lastPage}
        </span>
        <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
        >
            {t('common.next')} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
