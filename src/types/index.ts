// Types for POS Application

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  position: { x: number; y: number };
  currentOrder?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  image?: string;
  isActive: boolean;
  stock?: number;
  isStockManaged: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId?: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  customerId?: string;
  paymentStatus: 'pending' | 'paid' | 'partial';
  paymentMethod?: string;
  cashierId: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'qris' | 'transfer';
  timestamp: string;
  cashierId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'supervisor';
  isActive: boolean;
  createdAt: string;
}

export interface AppSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  currency: string;
  taxRate: number;
  serviceChargeRate: number;
  enableTax: boolean;
  enableServiceCharge: boolean;
  enableStockManagement: boolean;
  printReceipt: boolean;
  darkMode: boolean;
  language: 'id' | 'en';
}

export interface StockItem {
  id: string;
  menuItemId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastUpdated: string;
}