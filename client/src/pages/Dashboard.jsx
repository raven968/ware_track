import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();

  // Placeholder data - In real app, fetch from API
  const stats = [
    { 
      title: t('dashboard.stats.products'), 
      value: "120", 
      icon: Package,
      color: "text-blue-500",
      description: "+5 this month"
    },
    { 
      title: t('dashboard.stats.orders'), 
      value: "45", 
      icon: ShoppingCart,
      color: "text-green-500",
      description: "+12% from last month"
    },
    { 
      title: t('dashboard.stats.customers'), 
      value: "32", 
      icon: Users,
      color: "text-purple-500",
      description: "Active users"
    },
    { 
      title: "Revenue", 
      value: "$12,345", 
      icon: TrendingUp,
      color: "text-orange-500",
      description: "+8% growth"
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {t('dashboard.title')}
      </h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity / Charts Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-md border border-dashed">
              Chart Placeholder
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.stats.orders')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Order #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">customer{i}@example.com</p>
                  </div>
                  <div className="ml-auto font-medium">+$299.00</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
