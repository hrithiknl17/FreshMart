export type Category = string;

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  vendorId: string;
  sku: string;
  imageUrl?: string;
  expiryDate?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number;
}

export interface Delivery {
  id: string;
  vendorId: string;
  expectedDate: string;
  status: 'pending' | 'delivered' | 'delayed';
  items: { productId: string; quantity: number }[];
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface StockHistoryEntry {
  id: string;
  productId: string;
  date: string;
  change: number;
  reason: 'Sale' | 'Delivery' | 'Manual Adjustment' | 'Initial Stock';
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  customerId?: string;
  discountCode?: string;
  discountAmount?: number;
}
