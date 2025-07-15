import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, UtensilsCrossed, FolderPlus } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MenuItem, MenuCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";

const MenuManagement = () => {
  const [categories, setCategories] = useLocalStorage<MenuCategory[]>("pos-categories", []);
  const [menuItems, setMenuItems] = useLocalStorage<MenuItem[]>("pos-menu-items", []);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    isActive: true
  });
  
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    isActive: true,
    stock: 0,
    isStockManaged: false
  });
  
  const { toast } = useToast();

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...categoryForm }
          : cat
      ));
      toast({
        title: "Berhasil",
        description: "Kategori berhasil diperbarui"
      });
      setEditingCategory(null);
    } else {
      const newCategory: MenuCategory = {
        id: Date.now().toString(),
        ...categoryForm
      };
      setCategories([...categories, newCategory]);
      toast({
        title: "Berhasil",
        description: "Kategori berhasil ditambahkan"
      });
    }
    
    setCategoryForm({ name: "", description: "", isActive: true });
    setIsCategoryDialogOpen(false);
  };

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...itemForm }
          : item
      ));
      toast({
        title: "Berhasil",
        description: "Menu berhasil diperbarui"
      });
      setEditingItem(null);
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        ...itemForm
      };
      setMenuItems([...menuItems, newItem]);
      toast({
        title: "Berhasil",
        description: "Menu berhasil ditambahkan"
      });
    }
    
    setItemForm({
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      isActive: true,
      stock: 0,
      isStockManaged: false
    });
    setIsItemDialogOpen(false);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive
    });
    setIsCategoryDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      categoryId: item.categoryId,
      isActive: item.isActive,
      stock: item.stock || 0,
      isStockManaged: item.isStockManaged
    });
    setIsItemDialogOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    setMenuItems(menuItems.filter(item => item.categoryId !== id));
    toast({
      title: "Berhasil",
      description: "Kategori berhasil dihapus"
    });
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast({
      title: "Berhasil",
      description: "Menu berhasil dihapus"
    });
  };

  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === selectedCategory);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Tidak ada kategori";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Manajemen Menu</h1>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => {
                setEditingCategory(null);
                setCategoryForm({ name: "", description: "", isActive: true });
              }}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Kategori
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingItem(null);
                setItemForm({
                  name: "",
                  description: "",
                  price: 0,
                  categoryId: "",
                  isActive: true,
                  stock: 0,
                  isStockManaged: false
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Menu
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="menu" className="w-full">
        <TabsList>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
        </TabsList>
        
        <TabsContent value="menu" className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter kategori" />
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

          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Belum ada menu</h3>
                <p className="text-muted-foreground mb-4">
                  Mulai dengan menambahkan kategori dan menu untuk restoran Anda
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Tambah Kategori
                  </Button>
                  <Button onClick={() => setIsItemDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="relative group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Kategori: {getCategoryName(item.categoryId)}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      {item.isStockManaged && (
                        <p className="text-sm">
                          Stok: {item.stock}
                        </p>
                      )}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteItem(item.id)}
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
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FolderPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Belum ada kategori</h3>
                <p className="text-muted-foreground mb-4">
                  Buat kategori untuk mengelompokkan menu Anda
                </p>
                <Button onClick={() => setIsCategoryDialogOpen(true)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Tambah Kategori Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="relative group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.description && (
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                      <p className="text-sm">
                        {menuItems.filter(item => item.categoryId === category.id).length} menu
                      </p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCategory(category.id)}
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
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Nama Kategori</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Contoh: Makanan Utama, Minuman"
                required
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Deskripsi</Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Deskripsi kategori (opsional)"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="categoryActive"
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
              />
              <Label htmlFor="categoryActive">Aktif</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingCategory ? "Perbarui" : "Tambah"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu" : "Tambah Menu Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemName">Nama Menu</Label>
                <Input
                  id="itemName"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="Contoh: Nasi Goreng"
                  required
                />
              </div>
              <div>
                <Label htmlFor="itemPrice">Harga</Label>
                <Input
                  id="itemPrice"
                  type="number"
                  min="0"
                  step="1000"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: parseInt(e.target.value) })}
                  placeholder="25000"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="itemCategory">Kategori</Label>
              <Select value={itemForm.categoryId} onValueChange={(value) => setItemForm({ ...itemForm, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="itemDescription">Deskripsi</Label>
              <Textarea
                id="itemDescription"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Deskripsi menu (opsional)"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="itemActive"
                  checked={itemForm.isActive}
                  onCheckedChange={(checked) => setItemForm({ ...itemForm, isActive: checked })}
                />
                <Label htmlFor="itemActive">Aktif</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="itemStockManaged"
                  checked={itemForm.isStockManaged}
                  onCheckedChange={(checked) => setItemForm({ ...itemForm, isStockManaged: checked })}
                />
                <Label htmlFor="itemStockManaged">Kelola Stok</Label>
              </div>
            </div>
            {itemForm.isStockManaged && (
              <div>
                <Label htmlFor="itemStock">Stok</Label>
                <Input
                  id="itemStock"
                  type="number"
                  min="0"
                  value={itemForm.stock}
                  onChange={(e) => setItemForm({ ...itemForm, stock: parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingItem ? "Perbarui" : "Tambah"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;