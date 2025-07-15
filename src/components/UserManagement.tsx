import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Users, Shield, User, UserCheck } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { User as UserType } from "@/types";
import { useToast } from "@/hooks/use-toast";

const UserManagement = () => {
  const [users, setUsers] = useLocalStorage<UserType[]>("pos-users", []);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "cashier" as UserType['role'],
    isActive: true
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData }
          : user
      ));
      toast({
        title: "Berhasil",
        description: "Pengguna berhasil diperbarui"
      });
      setEditingUser(null);
    } else {
      const newUser: UserType = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setUsers([...users, newUser]);
      toast({
        title: "Berhasil",
        description: "Pengguna berhasil ditambahkan"
      });
    }
    
    setFormData({ name: "", email: "", role: "cashier", isActive: true });
    setIsUserDialogOpen(false);
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setIsUserDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    toast({
      title: "Berhasil",
      description: "Pengguna berhasil dihapus"
    });
  };

  const handleToggleActive = (id: string) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
    toast({
      title: "Berhasil",
      description: "Status pengguna berhasil diperbarui"
    });
  };

  const getRoleIcon = (role: UserType['role']) => {
    switch (role) {
      case 'admin': return Shield;
      case 'supervisor': return UserCheck;
      case 'cashier': return User;
      default: return User;
    }
  };

  const getRoleColor = (role: UserType['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'supervisor': return 'bg-blue-500';
      case 'cashier': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleText = (role: UserType['role']) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'supervisor': return 'Supervisor';
      case 'cashier': return 'Kasir';
      default: return 'Tidak diketahui';
    }
  };

  const getActiveUsers = () => users.filter(user => user.isActive);
  const getAdminUsers = () => users.filter(user => user.role === 'admin');
  const getCashierUsers = () => users.filter(user => user.role === 'cashier');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Manajemen Pengguna</h1>
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUser(null);
              setFormData({ name: "", email: "", role: "cashier", isActive: true });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengguna Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveUsers().length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAdminUsers().length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kasir</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCashierUsers().length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada pengguna</h3>
            <p className="text-muted-foreground mb-4">
              Tambahkan pengguna untuk mulai mengelola akses sistem
            </p>
            <Button onClick={() => setIsUserDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pengguna Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => {
            const RoleIcon = getRoleIcon(user.role);
            
            return (
              <Card key={user.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <RoleIcon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dibuat:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Aktif:</span>
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleActive(user.id)}
                      />
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="role">Peran</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserType['role'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Kasir</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingUser ? "Perbarui" : "Tambah"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;