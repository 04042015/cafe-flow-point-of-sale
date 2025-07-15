import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Download, TrendingUp, DollarSign, ShoppingCart, Users, BarChart3 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Order, MenuItem, MenuCategory } from "@/types";
import { cn } from "@/lib/utils";

const Reports = () => {
  const [orders] = useLocalStorage<Order[]>("pos-orders", []);
  const [menuItems] = useLocalStorage<MenuItem[]>("pos-menu-items", []);
  const [categories] = useLocalStorage<MenuCategory[]>("pos-categories", []);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [reportType, setReportType] = useState("sales");

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= dateRange.from && orderDate <= dateRange.to && order.status === 'completed';
  });

  const getTotalSales = () => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  };

  const getTotalOrders = () => {
    return filteredOrders.length;
  };

  const getTotalCustomers = () => {
    const uniqueCustomers = new Set(filteredOrders.map(order => order.customerId || order.tableId || 'takeaway'));
    return uniqueCustomers.size;
  };

  const getAverageOrderValue = () => {
    const total = getTotalSales();
    const count = getTotalOrders();
    return count > 0 ? total / count : 0;
  };

  const getTopSellingItems = () => {
    const itemSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        if (menuItem) {
          const existing = itemSales.get(item.menuItemId) || { name: menuItem.name, quantity: 0, revenue: 0 };
          itemSales.set(item.menuItemId, {
            name: menuItem.name,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + (item.price * item.quantity)
          });
        }
      });
    });

    return Array.from(itemSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  };

  const getSalesByCategory = () => {
    const categorySales = new Map<string, { name: string; revenue: number; quantity: number }>();
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        if (menuItem) {
          const category = categories.find(c => c.id === menuItem.categoryId);
          const categoryName = category ? category.name : 'Tidak ada kategori';
          const existing = categorySales.get(menuItem.categoryId) || { name: categoryName, revenue: 0, quantity: 0 };
          categorySales.set(menuItem.categoryId, {
            name: categoryName,
            revenue: existing.revenue + (item.price * item.quantity),
            quantity: existing.quantity + item.quantity
          });
        }
      });
    });

    return Array.from(categorySales.values())
      .sort((a, b) => b.revenue - a.revenue);
  };

  const getDailySales = () => {
    const dailySales = new Map<string, number>();
    
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toDateString();
      dailySales.set(date, (dailySales.get(date) || 0) + order.total);
    });

    return Array.from(dailySales.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, total]) => ({
        date: format(new Date(date), 'dd MMM yyyy', { locale: id }),
        total
      }));
  };

  const exportReport = () => {
    const reportData = {
      period: `${format(dateRange.from, 'dd MMM yyyy', { locale: id })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: id })}`,
      summary: {
        totalSales: getTotalSales(),
        totalOrders: getTotalOrders(),
        totalCustomers: getTotalCustomers(),
        averageOrderValue: getAverageOrderValue()
      },
      topSellingItems: getTopSellingItems(),
      salesByCategory: getSalesByCategory(),
      dailySales: getDailySales()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-penjualan-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Laporan Penjualan</h1>
        <Button onClick={exportReport}>
          <Download className="w-4 h-4 mr-2" />
          Export Laporan
        </Button>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tanggal Mulai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, 'dd MMM yyyy', { locale: id }) : 'Pilih tanggal'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>Tanggal Akhir</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, 'dd MMM yyyy', { locale: id }) : 'Pilih tanggal'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>Jenis Laporan</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Penjualan</SelectItem>
                  <SelectItem value="items">Produk</SelectItem>
                  <SelectItem value="categories">Kategori</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {getTotalSales().toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalOrders()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalCustomers()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Pesanan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {getAverageOrderValue().toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {getTopSellingItems().length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Belum ada data penjualan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getTopSellingItems().map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} terjual</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Rp {item.revenue.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Penjualan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {getSalesByCategory().length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Belum ada data penjualan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getSalesByCategory().map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.quantity} item</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Rp {category.revenue.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Penjualan Harian</CardTitle>
        </CardHeader>
        <CardContent>
          {getDailySales().length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada data penjualan harian</p>
            </div>
          ) : (
            <div className="space-y-2">
              {getDailySales().map((day, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{day.date}</span>
                  <span className="font-semibold">Rp {day.total.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;