import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Package, ShoppingCart, Users, Warehouse, UserCog, FolderTree } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: t('sidebar.dashboard'), path: '/' },
    { icon: Package, label: t('sidebar.products'), path: '/products' },
    { icon: FolderTree, label: t('sidebar.categories'), path: '/categories' },
    { icon: ShoppingCart, label: t('sidebar.orders'), path: '/orders' },
    { icon: Users, label: t('sidebar.customers'), path: '/customers' },
    { icon: Warehouse, label: t('sidebar.warehouses'), path: '/warehouses' },
    { icon: UserCog, label: t('sidebar.users'), path: '/users' },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          WareTrack
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">v1.0.0</p>
      </div>
    </div>
  );
}
