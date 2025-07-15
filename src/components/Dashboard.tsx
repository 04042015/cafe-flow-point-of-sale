import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  UtensilsCrossed,
  Package,
  Clock,
  AlertTriangle
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Penjualan Hari Ini",
      value: "Rp 0",
      icon: DollarSign,
      change: "+0%",
      changeType: "positive"
    },
    {
      title: "Total Pesanan",
      value: "0",
      icon: ShoppingCart,
      change: "+0%",
      changeType: "positive"
    },
    {
      title: "Meja Aktif",
      value: "0",
      icon: UtensilsCrossed,
      change: "0%",
      changeType: "neutral"
    },
    {
      title: "Pelanggan",
      value: "0",
      icon: Users,
      change: "+0%",
      changeType: "positive"
    }
  ];

  const recentOrders = [
    // Empty state - no dummy data
  ];

  const lowStockItems = [
    // Empty state - no dummy data
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={`${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  {" dari kemarin"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pesanan Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Belum ada pesanan hari ini</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Pesanan akan muncul di sini setelah pelanggan melakukan pemesanan
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Orders will be displayed here */}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Semua stok dalam kondisi baik</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Peringatan stok akan muncul di sini jika ada item yang hampir habis
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Low stock items will be displayed here */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Kelola Meja</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Tambah Menu</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Lihat Laporan</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Cek Stok</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;