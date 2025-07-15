import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, ShoppingCart, Receipt, Clock, CheckCircle, XCircle } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Order, OrderItem, Table, MenuItem, MenuCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";

const OrderManagement = () => {
  const [orders, setOrders] = useLocalStorage<Order[]>("pos-orders", []);
  const [tables, setTables] = useLocalStorage<Table[]>("pos-tables", []);
  const [menuItems, setMenuItems] = useLocalStorage<MenuItem[]>("pos-menu-items", []);
  const [categories, setCategories] = useLocalStorage<MenuCategory[]>("pos-categories", []);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const { toast } = useToast();

  const handleAddItem = (menuItem: MenuItem) => {
    const existingItem = currentOrder.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem) {
      setCurrentOrder(currentOrder.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newOrderItem: OrderItem = {
        id: Date.now().toString(),
        menuItemId: menuItem.id,
        quantity: 1,
        price: menuItem.price,
        notes: ""
      };
      setCurrentOrder([...currentOrder, newOrderItem]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCurrentOrder(currentOrder.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    setCurrentOrder(currentOrder.map(item =>
      item.id === itemId
        ? { ...item, quantity }
        : item
    ));
  };

  const calculateTotal = () => {
    const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const serviceCharge = subtotal * 0.05; // 5% service charge
    const total = subtotal + tax + serviceCharge;
    
    return { subtotal, tax, serviceCharge, total };
  };

  const handleCreateOrder = () => {
    if (currentOrder.length === 0) {
      toast({
        title: "Error",
        description: "Tambahkan item ke pesanan terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    const { subtotal, tax, serviceCharge, total } = calculateTotal();
    
    const newOrder: Order = {
      id: Date.now().toString(),
      tableId: selectedTable || undefined,
      items: currentOrder,
      status: "pending",
      subtotal,
      tax,
      serviceCharge,
      discount: 0,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: "pending",
      cashierId: "current-user"
    };

    setOrders([...orders, newOrder]);
    
    // Update table status if table is selected
    if (selectedTable) {
      setTables(tables.map(table =>
        table.id === selectedTable
          ? { ...table, status: "occupied", currentOrder: newOrder.id }
          : table
      ));
    }

    setCurrentOrder([]);
    setSelectedTable("");
    setIsNewOrderOpen(false);
    
    toast({
      title: "Berhasil",
      description: "Pesanan berhasil dibuat"
    });
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    ));
    
    toast({
      title: "Berhasil",
      description: `Status pesanan diperbarui menjadi ${getStatusText(status)}`
    });
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

  const getMenuItemName = (menuItemId: string) => {
    const item = menuItems.find(item => item.id === menuItemId);
    return item ? item.name : "Item tidak ditemukan";
  };

  const getTableName = (tableId?: string) => {
    if (!tableId) return "Takeaway";
    const table = tables.find(t => t.id === tableId);
    return table ? table.name : "Meja tidak ditemukan";
  };

  const filteredMenuItems = selectedCategory === "all" 
    ? menuItems.filter(item => item.isActive)
    : menuItems.filter(item => item.isActive && item.categoryId === selectedCategory);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Manajemen Pesanan</h1>
        <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setCurrentOrder([]);
              setSelectedTable("");
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Pesanan Baru
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">Pesanan Aktif</TabsTrigger>
          <TabsTrigger value="completed">Selesai</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-4">
          {orders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Belum ada pesanan aktif</h3>
                <p className="text-muted-foreground mb-4">
                  Mulai dengan membuat pesanan baru untuk pelanggan
                </p>
                <Button onClick={() => setIsNewOrderOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Pesanan Baru
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders
                .filter(order => order.status !== 'completed' && order.status !== 'cancelled')
                .map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Pesanan #{order.id.slice(-4)}
                        </CardTitle>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getTableName(order.tableId)} • {new Date(order.createdAt).toLocaleTimeString('id-ID')}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantity}x {getMenuItemName(item.menuItemId)}</span>
                            <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>Rp {order.total.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                              className="flex-1"
                            >
                              Mulai Buat
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                              className="flex-1"
                            >
                              Siap
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'served')}
                              className="flex-1"
                            >
                              Diantar
                            </Button>
                          )}
                          {order.status === 'served' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                              className="flex-1"
                            >
                              Selesai
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders
              .filter(order => order.status === 'completed' || order.status === 'cancelled')
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Pesanan #{order.id.slice(-4)}
                      </CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getTableName(order.tableId)} • {new Date(order.createdAt).toLocaleTimeString('id-ID')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity}x {getMenuItemName(item.menuItemId)}</span>
                          <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>Rp {order.total.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Order Dialog */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pesanan Baru</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Menu Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="table">Pilih Meja (Opsional)</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih meja atau biarkan kosong untuk takeaway" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.filter(table => table.status === 'available').map(table => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.name} (Kapasitas: {table.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Filter Kategori</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMenuItems.map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:bg-accent" onClick={() => handleAddItem(item)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <p className="text-lg font-bold text-primary">
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <Button onClick={(e) => {
                          e.stopPropagation();
                          handleAddItem(item);
                        }}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ringkasan Pesanan</h3>
              
              {currentOrder.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Belum ada item dalam pesanan</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentOrder.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <h4 className="font-semibold">{getMenuItemName(item.menuItemId)}</h4>
                          <p className="text-sm text-muted-foreground">
                            Rp {item.price.toLocaleString('id-ID')} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rp {calculateTotal().subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pajak (10%):</span>
                      <span>Rp {calculateTotal().tax.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service (5%):</span>
                      <span>Rp {calculateTotal().serviceCharge.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>Rp {calculateTotal().total.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCreateOrder} className="flex-1">
                      Buat Pesanan
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentOrder([])}>
                      Reset
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;