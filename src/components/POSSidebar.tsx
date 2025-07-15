import { useState } from "react";
import { 
  Home, 
  ShoppingCart, 
  UtensilsCrossed, 
  Users, 
  BarChart3, 
  Settings,
  History,
  Package,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface POSSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const POSSidebar = ({ currentPage, onPageChange }: POSSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "tables", label: "Meja", icon: UtensilsCrossed },
    { id: "menu", label: "Menu", icon: ShoppingCart },
    { id: "orders", label: "Pesanan", icon: ShoppingCart },
    { id: "reports", label: "Laporan", icon: BarChart3 },
    { id: "inventory", label: "Stok", icon: Package },
    { id: "history", label: "Riwayat", icon: History },
    { id: "users", label: "Pengguna", icon: Users },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">CafeFlow POS</h2>
              <p className="text-xs text-sidebar-foreground/60">Point of Sale</p>
            </div>
          )}
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                currentPage === item.id && "bg-sidebar-primary text-sidebar-primary-foreground",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Keluar</span>}
        </Button>
      </div>
    </div>
  );
};

export default POSSidebar;