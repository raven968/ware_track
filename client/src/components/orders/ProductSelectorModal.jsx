import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios";
import { handleApiError } from "@/lib/errorHandler";

export function ProductSelectorModal({ isOpen, onClose, onSelect, priceListId }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        loadProducts(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
        setSearch(""); // Reset search term
        if (products.length === 0) {
            loadProducts("");   
        }
    }
  }, [isOpen]);

  const loadProducts = async (searchTerm = "") => {
    setLoading(true);
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await api.get('/products', { params });
      // Handling both paginated and flat responses
      const data = response.data.data || response.data;
      setProducts(data);
    } catch (error) {
      handleApiError(error, t('common.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (product) => {
    onSelect(product);
    onClose();
  };

  const getPrice = (product) => {
    let price = parseFloat(product.price || 0);
    if (priceListId && product.price_lists) {
        const targetId = parseInt(priceListId);
        const pl = product.price_lists.find(p => p.id === targetId);
        if (pl && pl.pivot && pl.pivot.price) {
            price = parseFloat(pl.pivot.price);
        }
    }
    return price.toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('products.select_modal.title') || "Select Product"}</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('products.select_modal.search_placeholder') || "Search by name, SKU..."}
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('products.table.name')}</TableHead>
                        <TableHead>{t('products.table.sku')}</TableHead>
                        <TableHead>{t('products.table.stock')}</TableHead>
                        <TableHead className="text-right">{t('products.table.price')}</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">{t('common.loading')}</TableCell>
                        </TableRow>
                    ) : products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                {t('common.no_results') || "No products found."}
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.sku}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell className="text-right">${getPrice(product)}</TableCell>
                                <TableCell>
                                    <Button size="sm" onClick={() => handleSelect(product)}>
                                        {t('common.select') || "Select"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
