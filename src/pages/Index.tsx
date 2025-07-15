import { useState } from "react";
import POSSidebar from "@/components/POSSidebar";
import Dashboard from "@/components/Dashboard";
import TableManagement from "@/components/TableManagement";
import MenuManagement from "@/components/MenuManagement";
import OrderManagement from "@/components/OrderManagement";
import Reports from "@/components/Reports";
import InventoryManagement from "@/components/InventoryManagement";
import TransactionHistory from "@/components/TransactionHistory";
import UserManagement from "@/components/UserManagement";
import Settings from "@/components/Settings";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "tables":
        return <TableManagement />;
      case "menu":
        return <MenuManagement />;
      case "orders":
        return <OrderManagement />;
      case "reports":
        return <Reports />;
      case "inventory":
        return <InventoryManagement />;
      case "history":
        return <TransactionHistory />;
      case "users":
        return <UserManagement />;
      case "settings":
        return <Settings />;
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
