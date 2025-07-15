import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MenuItem, StockItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

const InventoryManagement = () => {
  const [menuItems, setMenuItems] = useLocalStorage<MenuItem[]>("pos-menu-items", []);
  const [stockItems, setStockItems] = useLocalStorage<StockItem[]>("pos-stock-items", []);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState({
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unit: "pcs"
  });
  const { toast } = useToast();

  const managedItems = menuItems.filter(item => item.isStockManaged);

  const getStockInfo = (menuItemId: string) => {
    return stockItems.find(stock => stock.menuItemId === menuItemId);
  };

  const getStockStatus = (menuItemId: string) => {
    const stockInfo = getStockInfo(menuItemId);
    const menuItem = menuItems.find(item => item.id === menuItemId);
    
    if (!stockInfo || !menuItem) return 'unknown';
    
    const currentStock = stockInfo.currentStock;
    const minStock = stockInfo.minStock;
    
    if (currentStock <= 0) return 'out';
    if (currentStock <= minStock) return 'low';
    if (currentStock > stockInfo.maxStock) return 'high';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out': return 'bg-red-500';
      case 'low': return 'bg-yellow-500';
      case 'high': return 'bg-blue-500';
      case 'normal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'out': return 'Habis';
      case 'low': return 'Menipis';
      case 'high': return 'Berlebih';
      case 'normal': return 'Normal';
      default: return 'Tidak diketahui';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingStock) return;

    const updatedStock: StockItem = {
      ...editingStock,
      ...formData,
      lastUpdated: new Date().toISOString()
    };

    if (editingStock.id) {
      setStockItems(stockItems.map(stock => 
        stock.id === editingStock.id ? updatedStock : stock
      ));
    } else {
      const newStock: StockItem = {
        id: Date.now().toString(),
        menuItemId: editingStock.menuItemId,
        ...formData,
        lastUpdated: new Date().toISOString()
      };
      setStockItems([...stockItems, newStock]);
    }

    toast({
      title: "Berhasil",
      description: "Stok berhasil diperbarui"
    });
    
    setFormData({ currentStock: 0, minStock: 0, maxStock: 0, unit: "pcs" });
    setEditingStock(null);
    setIsStockDialogOpen(false);
  };

  const handleEdit = (menuItemId: string) => {
    const stockInfo = getStockInfo(menuItemId);
    if (stockInfo) {
      setEditingStock(stockInfo);
      setFormData({
        currentStock: stockInfo.currentStock,
        minStock: stockInfo.minStock,
        maxStock: stockInfo.maxStock,
        unit: stockInfo.unit
      });
    } else {
      setEditingStock({
        id: '',
        menuItemId,
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unit: 'pcs',
        lastUpdated: new Date().toISOString()
      });
      setFormData({ currentStock: 0, minStock: 0, maxStock: 0, unit: "pcs" });
    }
    setIsStockDialogOpen(true);
  };

  const handleStockAdjustment = (menuItemId: string, adjustment: number) => {
    const stockInfo = getStockInfo(menuItemId);
    if (stockInfo) {
      const newStock = Math.max(0, stockInfo.currentStock + adjustment);
      const updatedStock = {
        ...stockInfo,
        currentStock: newStock,
        lastUpdated: new Date().toISOString()
      };
      
      setStockItems(stockItems.map(stock => 
        stock.id === stockInfo.id ? updatedStock : stock
      ));
      
      toast({
        title: "Berhasil",
        description: `Stok ${adjustment > 0 ? 'ditambah' : 'dikurangi'} sebanyak ${Math.abs(adjustment)}`
      });
    }
  };

  const getLowStockItems = () => {
    return managedItems.filter(item => {
      const status = getStockStatus(item.id);
      return status === 'low' || status === 'out';
    });
  };

  const getStockValue = () => {
    return stockItems.reduce((total, stock) => {
      const menuItem = menuItems.find(item => item.id === stock.menuItemId);
      return total + (menuItem ? stock.currentStock * menuItem.price : 0);
    }, 0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Manajemen Stok</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <TrendingDown className="w-4 h-4 mr-2" />
            Stok Masuk
          </Button>
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Stok Keluar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Item</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managedItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getLowStockItems().length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Stok</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {getStockValue().toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item Aktif</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managedItems.filter(item => item.isActive).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {getLowStockItems().length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Peringatan Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getLowStockItems().map((item) => {
                const stockInfo = getStockInfo(item.id);
                return (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stok: {stockInfo?.currentStock || 0} {stockInfo?.unit || 'pcs'}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleEdit(item.id)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Atur
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Items */}
      {managedItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada item dengan manajemen stok</h3>
            <p className="text-muted-foreground mb-4">
              Aktifkan manajemen stok pada menu untuk mulai mengelola stok
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {managedItems.map((item) => {
            const stockInfo = getStockInfo(item.id);
            const status = getStockStatus(item.id);
            
            return (
              <Card key={item.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge className={getStatusColor(status)}>
                      {getStatusText(status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Stok Saat Ini</p>
                        <p className="font-semibold">{stockInfo?.currentStock || 0} {stockInfo?.unit || 'pcs'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stok Minimum</p>
                        <p className="font-semibold">{stockInfo?.minStock || 0} {stockInfo?.unit || 'pcs'}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockAdjustment(item.id, -1)}
                      >
                        -1
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockAdjustment(item.id, 1)}
                      >
                        +1
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item.id)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Atur
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Stock Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Atur Stok - {editingStock && menuItems.find(item => item.id === editingStock.menuItemId)?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStock">Stok Saat Ini</Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Satuan</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="pcs, kg, liter, dll"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minStock">Stok Minimum</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxStock">Stok Maksimum</Label>
                <Input
                  id="maxStock"
                  type="number"
                  min="0"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Simpan
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;