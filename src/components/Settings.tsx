import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Store, Calculator, Palette, Globe, Shield } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AppSettings } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>("pos-settings", {
    storeName: "",
    storeAddress: "",
    storePhone: "",
    currency: "IDR",
    taxRate: 10,
    serviceChargeRate: 5,
    enableTax: true,
    enableServiceCharge: true,
    enableStockManagement: true,
    printReceipt: true,
    darkMode: false,
    language: "id"
  });
  
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Berhasil",
      description: "Pengaturan berhasil disimpan"
    });
  };

  const handleReset = () => {
    const defaultSettings: AppSettings = {
      storeName: "",
      storeAddress: "",
      storePhone: "",
      currency: "IDR",
      taxRate: 10,
      serviceChargeRate: 5,
      enableTax: true,
      enableServiceCharge: true,
      enableStockManagement: true,
      printReceipt: true,
      darkMode: false,
      language: "id"
    };
    setSettings(defaultSettings);
    toast({
      title: "Berhasil",
      description: "Pengaturan berhasil direset ke default"
    });
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings({ ...settings, ...updates });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Pengaturan Sistem</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset Default
          </Button>
          <Button onClick={handleSave}>
            Simpan Pengaturan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="store">Toko</TabsTrigger>
          <TabsTrigger value="financial">Keuangan</TabsTrigger>
          <TabsTrigger value="operations">Operasional</TabsTrigger>
          <TabsTrigger value="interface">Tampilan</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Informasi Toko
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="storeName">Nama Toko/Restoran</Label>
                <Input
                  id="storeName"
                  value={settings.storeName}
                  onChange={(e) => updateSettings({ storeName: e.target.value })}
                  placeholder="Masukkan nama toko"
                />
              </div>
              
              <div>
                <Label htmlFor="storeAddress">Alamat</Label>
                <Textarea
                  id="storeAddress"
                  value={settings.storeAddress}
                  onChange={(e) => updateSettings({ storeAddress: e.target.value })}
                  placeholder="Masukkan alamat lengkap toko"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="storePhone">Nomor Telepon</Label>
                <Input
                  id="storePhone"
                  value={settings.storePhone}
                  onChange={(e) => updateSettings({ storePhone: e.target.value })}
                  placeholder="Contoh: +62 21 1234 5678"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Pengaturan Keuangan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Mata Uang</Label>
                <Select value={settings.currency} onValueChange={(value) => updateSettings({ currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">Rupiah (IDR)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxRate">Tarif Pajak (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => updateSettings({ taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="serviceChargeRate">Service Charge (%)</Label>
                  <Input
                    id="serviceChargeRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.serviceChargeRate}
                    onChange={(e) => updateSettings({ serviceChargeRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableTax">Aktifkan Pajak</Label>
                    <p className="text-sm text-muted-foreground">
                      Otomatis menghitung pajak pada setiap transaksi
                    </p>
                  </div>
                  <Switch
                    id="enableTax"
                    checked={settings.enableTax}
                    onCheckedChange={(checked) => updateSettings({ enableTax: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableServiceCharge">Aktifkan Service Charge</Label>
                    <p className="text-sm text-muted-foreground">
                      Otomatis menghitung biaya layanan
                    </p>
                  </div>
                  <Switch
                    id="enableServiceCharge"
                    checked={settings.enableServiceCharge}
                    onCheckedChange={(checked) => updateSettings({ enableServiceCharge: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Pengaturan Operasional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableStockManagement">Manajemen Stok</Label>
                  <p className="text-sm text-muted-foreground">
                    Aktifkan sistem tracking stok otomatis
                  </p>
                </div>
                <Switch
                  id="enableStockManagement"
                  checked={settings.enableStockManagement}
                  onCheckedChange={(checked) => updateSettings({ enableStockManagement: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="printReceipt">Cetak Struk Otomatis</Label>
                  <p className="text-sm text-muted-foreground">
                    Otomatis mencetak struk setelah pembayaran
                  </p>
                </div>
                <Switch
                  id="printReceipt"
                  checked={settings.printReceipt}
                  onCheckedChange={(checked) => updateSettings({ printReceipt: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Pengaturan Tampilan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="language">Bahasa</Label>
                <Select value={settings.language} onValueChange={(value) => updateSettings({ language: value as 'id' | 'en' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode">Mode Gelap</Label>
                  <p className="text-sm text-muted-foreground">
                    Aktifkan tema gelap untuk tampilan yang lebih nyaman
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Pengaturan Sistem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Backup & Restore</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                      const allData = {
                        settings,
                        tables: localStorage.getItem('pos-tables'),
                        categories: localStorage.getItem('pos-categories'),
                        menuItems: localStorage.getItem('pos-menu-items'),
                        orders: localStorage.getItem('pos-orders'),
                        users: localStorage.getItem('pos-users'),
                        stockItems: localStorage.getItem('pos-stock-items')
                      };
                      
                      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
                      link.click();
                      URL.revokeObjectURL(url);
                      
                      toast({
                        title: "Berhasil",
                        description: "Backup data berhasil didownload"
                      });
                    }}>
                      Download Backup
                    </Button>
                    <Button variant="outline" onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            try {
                              const data = JSON.parse(e.target?.result as string);
                              // Restore data
                              if (data.settings) setSettings(data.settings);
                              if (data.tables) localStorage.setItem('pos-tables', data.tables);
                              if (data.categories) localStorage.setItem('pos-categories', data.categories);
                              if (data.menuItems) localStorage.setItem('pos-menu-items', data.menuItems);
                              if (data.orders) localStorage.setItem('pos-orders', data.orders);
                              if (data.users) localStorage.setItem('pos-users', data.users);
                              if (data.stockItems) localStorage.setItem('pos-stock-items', data.stockItems);
                              
                              toast({
                                title: "Berhasil",
                                description: "Data berhasil direstore. Silakan refresh halaman."
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "File backup tidak valid",
                                variant: "destructive"
                              });
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}>
                      Upload Restore
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Reset Data</h3>
                  <Button variant="destructive" onClick={() => {
                    if (confirm('Yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
                      localStorage.clear();
                      toast({
                        title: "Berhasil",
                        description: "Semua data berhasil dihapus. Silakan refresh halaman."
                      });
                    }
                  }}>
                    Hapus Semua Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;