import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, UtensilsCrossed } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Table } from "@/types";
import { useToast } from "@/hooks/use-toast";

const TableManagement = () => {
  const [tables, setTables] = useLocalStorage<Table[]>("pos-tables", []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 2,
    status: "available" as Table['status']
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTable) {
      setTables(tables.map(table => 
        table.id === editingTable.id 
          ? { ...table, ...formData }
          : table
      ));
      toast({
        title: "Berhasil",
        description: "Meja berhasil diperbarui"
      });
      setEditingTable(null);
    } else {
      const newTable: Table = {
        id: Date.now().toString(),
        ...formData,
        position: { x: 0, y: 0 }
      };
      setTables([...tables, newTable]);
      toast({
        title: "Berhasil",
        description: "Meja berhasil ditambahkan"
      });
    }
    
    setFormData({ name: "", capacity: 2, status: "available" });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity,
      status: table.status
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTables(tables.filter(table => table.id !== id));
    toast({
      title: "Berhasil",
      description: "Meja berhasil dihapus"
    });
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'cleaning': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'Tersedia';
      case 'occupied': return 'Terisi';
      case 'reserved': return 'Reservasi';
      case 'cleaning': return 'Bersih-bersih';
      default: return 'Tidak diketahui';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Manajemen Meja</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTable(null);
              setFormData({ name: "", capacity: 2, status: "available" });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Meja
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTable ? "Edit Meja" : "Tambah Meja Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Meja</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Meja 1, VIP 1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Kapasitas</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Table['status'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Tersedia</SelectItem>
                    <SelectItem value="occupied">Terisi</SelectItem>
                    <SelectItem value="reserved">Reservasi</SelectItem>
                    <SelectItem value="cleaning">Bersih-bersih</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingTable ? "Perbarui" : "Tambah"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tables.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada meja</h3>
            <p className="text-muted-foreground mb-4">
              Mulai dengan menambahkan meja untuk restoran Anda
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Meja Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <Card key={table.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{table.name}</CardTitle>
                  <Badge className={getStatusColor(table.status)}>
                    {getStatusText(table.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Kapasitas: {table.capacity} orang
                  </p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(table)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(table.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableManagement;