import { useState } from "react";
import POSSidebar from "@/components/POSSidebar";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "tables":
        return <div className="p-6"><h1 className="text-2xl font-bold">Manajemen Meja</h1><p className="text-muted-foreground mt-2">Fitur ini akan segera tersedia</p></div>;
      case "menu":
        return <div className="p-6"><h1 className="text-2xl font-bold">Manajemen Menu</h1><p className="text-muted-foreground mt-2">Fitur ini akan segera tersedia</p></div>;
      case "orders":
        return <div className="p-6"><h1 className="text-2xl font-bold">Manajemen Pesanan</h1><p className="text-muted-foreground mt-2">Fitur ini akan segera tersedia</p></div>;
      case "reports":
        return <div className="p-6"><h1 className="text-2xl font-bold">Laporan</h1><p className="text-muted-foreground mt-2">Fitur ini akan segera tersedia</p></div>;
      case "inventory":
        return <div className="p-6"><h1 className="text-2xl font-bold">Manajemen Stok</h1><p className="text-muted-foreground mt-2">Fitur ini akan segera tersedia</p></div>;
      case "history":
        return <div className="p-6"><h1 className="text-2xl font-bold">Riwayat Transaksi</h1><p className="text-muted-foreground mt-2">Fitur ini akan segera tersedia</p></div>;
      case "users":
        return <div className="p-6"><h1 className="text-2xl font-bold">Manajemen Pengguna</h1><p className="text-muted-foreground mt-2">Fitur ini akan segera tersedia</p></div>;
      case "settings":
        return <div className="p-6"><h1 className="text-2xl font-bold">Pengaturan</h1><p className="text-muted-foreground mt-2">Fitur ini akan segera tersedia</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <POSSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 overflow-auto">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default Index;
