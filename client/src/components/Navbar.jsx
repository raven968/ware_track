import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { LogOut, Globe } from 'lucide-react';
import api from '@/lib/axios';

export default function Navbar() {
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800">
        {/* Title could change based on route, or static */}
      </h2>

      <div className="flex items-center space-x-4">
        {/* Language Switcher */}
        <Button variant="ghost" size="icon" onClick={toggleLanguage} title="Switch Language">
          <Globe className="h-5 w-5 text-gray-600" />
          <span className="sr-only">Toggle Language</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </Button>
        <span className="text-sm font-bold text-gray-600 uppercase">{i18n.language}</span>

        <div className="h-6 w-px bg-gray-300 mx-2"></div>

        {/* User Profile / Logout */}
        <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleLogout}
        >
            <LogOut size={16} />
            {t('dashboard.logout')}
        </Button>
      </div>
    </header>
  );
}
