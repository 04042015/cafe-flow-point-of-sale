import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Search, Receipt, Eye, Filter, Download } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Order, MenuItem, Table } from "@/types";

const TransactionHistory = () => {
  const [orders] = useLocalStorage<Order[]>("pos-orders", []);
  const [menuItems] = useLocalStorage<MenuItem[]>("pos-menu-items", []);
  const [tables] = useLocalStorage<Table[]>("pos-tables", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const getFilteredOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTableName(order.tableId).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === dateFilter.toDateString();
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getMenuItemName = (menuItemId: string) => {
    const item = menuItems.find(item => item.id === menuItemId);
    return item ? item.name : "Item tidak ditemukan";
  };

  const getTableName = (tableId?: string) => {
    if (!tableId) return "Takeaway";
    const table = tables.find(t => t.id === tableId);
    return table ? table.name : "Meja tidak ditemukan";
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'served': return 'bg-purple-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'preparing': return 'Sedang Dibuat';
      case 'ready': return 'Siap';
      case 'served': return 'Diantar';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return 'Tidak diketahui';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'paid': return 'bg-green-500';
      case 'partial': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusText = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'Belum Bayar';
      case 'paid': return 'Sudah Bayar';
      case 'partial': return 'Sebagian';
      default: return 'Tidak diketahui';
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const exportTransactions = () => {
    const filteredOrders = getFilteredOrders();
    const csvData = [
      ['ID Pesanan', 'Meja', 'Total', 'Status', 'Pembayaran', 'Tanggal', 'Waktu'],
      ...filteredOrders.map(order => [
        order.id,
        getTableName(order.tableId),
        order.total,
        getStatusText(order.status),
        getPaymentStatusText(order.paymentStatus),
        format(new Date(order.createdAt), 'dd/MM/yyyy'),
        format(new Date(order.createdAt), 'HH:mm')
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `riwayat-transaksi-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Riwayat Transaksi</h1>
        <Button onClick={exportTransactions}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari ID pesanan atau meja..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, 'dd MMM yyyy', { locale: id }) : 'Semua tanggal'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <select
              className="px-3 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="preparing">Sedang Dibuat</option>
              <option value="ready">Siap</option>
              <option value="served">Diantar</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setDateFilter(undefined);
              setStatusFilter("all");
            }}>
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      {getFilteredOrders().length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada transaksi</h3>
            <p className="text-muted-foreground">
              Transaksi akan muncul di sini setelah ada pesanan
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {getFilteredOrders().map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold">Pesanan #{order.id.slice(-8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getTableName(order.tableId)} • {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: id })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-lg">Rp {order.total.toLocaleString('id-ID')}</p>
                      <p className="text-sm text-muted-foreground">{order.items.length} item</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(order)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detail Pesanan #{selectedOrder?.id.slice(-8)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meja</p>
                  <p>{getTableName(selectedOrder.tableId)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal & Waktu</p>
                  <p>{format(new Date(selectedOrder.createdAt), 'dd MMM yyyy HH:mm', { locale: id })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pembayaran</p>
                  <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                    {getPaymentStatusText(selectedOrder.paymentStatus)}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Item Pesanan</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{getMenuItemName(item.menuItemId)}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">Catatan: {item.notes}</p>
                        )}
                      </div>
                      <p className="font-semibold">
                        Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp {selectedOrder.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak:</span>
                    <span>Rp {selectedOrder.tax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge:</span>
                    <span>Rp {selectedOrder.serviceCharge.toLocaleString('id-ID')}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Diskon:</span>
                      <span>-Rp {selectedOrder.discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionHistory;