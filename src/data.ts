import { Product, Vendor, Delivery, Sale, SaleItem, Customer, Discount, StockHistoryEntry } from './types';

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '555-0201', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'c2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-0202', createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: 'c3', name: 'Alice Johnson', email: 'alice.j@example.com', phone: '555-0203', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
];

export const mockDiscounts: Discount[] = [
  { id: 'd1', code: 'SUMMER10', type: 'percentage', value: 10, active: true },
  { id: 'd2', code: 'WELCOME5', type: 'fixed', value: 5, active: true },
  { id: 'd3', code: 'EXPIRED20', type: 'percentage', value: 20, active: false },
];

export const mockVendors: Vendor[] = [
  { id: 'v1', name: 'Fresh Farms Co.', contactPerson: 'Alice Smith', email: 'alice@freshfarms.com', phone: '555-0101', rating: 4.8 },
  { id: 'v2', name: 'Dairy Best', contactPerson: 'Bob Jones', email: 'bob@dairybest.com', phone: '555-0102', rating: 4.5 },
  { id: 'v3', name: 'Global Pantry Supplies', contactPerson: 'Charlie Brown', email: 'charlie@globalpantry.com', phone: '555-0103', rating: 4.2 },
  { id: 'v4', name: 'Prime Meats', contactPerson: 'Diana Prince', email: 'diana@primemeats.com', phone: '555-0104', rating: 4.9 },
];

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Organic Bananas', category: 'produce', price: 0.99, cost: 0.50, stock: 150, minStock: 50, vendorId: 'v1', sku: 'PRD-001', expiryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] },
  { id: 'p2', name: 'Whole Milk 1 Gal', category: 'dairy', price: 3.49, cost: 2.00, stock: 45, minStock: 20, vendorId: 'v2', sku: 'DAI-001', expiryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0] },
  { id: 'p3', name: 'Sourdough Bread', category: 'bakery', price: 4.99, cost: 2.50, stock: 12, minStock: 15, vendorId: 'v3', sku: 'BAK-001', expiryDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0] },
  { id: 'p4', name: 'Ground Beef 80/20', category: 'meat', price: 5.99, cost: 3.50, stock: 30, minStock: 20, vendorId: 'v4', sku: 'MEA-001', expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0] },
  { id: 'p5', name: 'Canned Black Beans', category: 'pantry', price: 1.29, cost: 0.60, stock: 200, minStock: 100, vendorId: 'v3', sku: 'PAN-001', expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0] },
  { id: 'p6', name: 'Orange Juice 64oz', category: 'beverages', price: 4.49, cost: 2.80, stock: 60, minStock: 30, vendorId: 'v2', sku: 'BEV-001', expiryDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0] },
  { id: 'p7', name: 'Frozen Pizza', category: 'frozen', price: 6.99, cost: 4.00, stock: 25, minStock: 20, vendorId: 'v3', sku: 'FRO-001', expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0] },
  { id: 'p8', name: 'Avocados', category: 'produce', price: 1.50, cost: 0.80, stock: 80, minStock: 40, vendorId: 'v1', sku: 'PRD-002', expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] },
];

export const mockDeliveries: Delivery[] = [
  { id: 'd1', vendorId: 'v1', expectedDate: new Date(Date.now() + 86400000).toISOString(), status: 'pending', items: [{ productId: 'p1', quantity: 200 }, { productId: 'p8', quantity: 100 }] },
  { id: 'd2', vendorId: 'v3', expectedDate: new Date(Date.now() + 172800000).toISOString(), status: 'pending', items: [{ productId: 'p3', quantity: 50 }, { productId: 'p5', quantity: 300 }] },
  { id: 'd3', vendorId: 'v2', expectedDate: new Date(Date.now() - 86400000).toISOString(), status: 'delivered', items: [{ productId: 'p2', quantity: 100 }] },
];

// Generate some mock sales for the last 7 days
const generateMockSales = (): Sale[] => {
  const sales: Sale[] = [];
  const now = new Date();
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const date = new Date(now.getTime() - daysAgo * 86400000 - Math.random() * 86400000);
    
    const numItems = Math.floor(Math.random() * 5) + 1;
    const items: SaleItem[] = [];
    let total = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      items.push({ productId: product.id, quantity, price: product.price });
      total += product.price * quantity;
    }
    
    const randomCustomer = Math.random() > 0.3 ? mockCustomers[Math.floor(Math.random() * mockCustomers.length)].id : undefined;

    sales.push({
      id: `s${i}`,
      date: date.toISOString(),
      items,
      total,
      paymentMethod: Math.random() > 0.5 ? 'card' : 'cash',
      customerId: randomCustomer,
    });
  }
  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockSales = generateMockSales();

export const mockStockHistory: StockHistoryEntry[] = [
  { id: 'sh1', productId: 'p1', date: new Date(Date.now() - 5 * 86400000).toISOString(), change: 200, reason: 'Initial Stock' },
  { id: 'sh2', productId: 'p1', date: new Date(Date.now() - 2 * 86400000).toISOString(), change: -50, reason: 'Sale', note: 'Weekend rush' },
  { id: 'sh3', productId: 'p2', date: new Date(Date.now() - 10 * 86400000).toISOString(), change: 100, reason: 'Initial Stock' },
  { id: 'sh4', productId: 'p2', date: new Date(Date.now() - 1 * 86400000).toISOString(), change: -55, reason: 'Sale' },
  { id: 'sh5', productId: 'p3', date: new Date(Date.now() - 3 * 86400000).toISOString(), change: 30, reason: 'Initial Stock' },
  { id: 'sh6', productId: 'p3', date: new Date(Date.now() - 1 * 86400000).toISOString(), change: -18, reason: 'Sale' },
  { id: 'sh7', productId: 'p4', date: new Date(Date.now() - 7 * 86400000).toISOString(), change: 50, reason: 'Initial Stock' },
  { id: 'sh8', productId: 'p4', date: new Date(Date.now() - 2 * 86400000).toISOString(), change: -20, reason: 'Sale' },
  { id: 'sh9', productId: 'p5', date: new Date(Date.now() - 15 * 86400000).toISOString(), change: 250, reason: 'Initial Stock' },
  { id: 'sh10', productId: 'p5', date: new Date(Date.now() - 5 * 86400000).toISOString(), change: -50, reason: 'Sale' },
  { id: 'sh11', productId: 'p6', date: new Date(Date.now() - 8 * 86400000).toISOString(), change: 100, reason: 'Initial Stock' },
  { id: 'sh12', productId: 'p6', date: new Date(Date.now() - 3 * 86400000).toISOString(), change: -40, reason: 'Sale' },
  { id: 'sh13', productId: 'p7', date: new Date(Date.now() - 20 * 86400000).toISOString(), change: 40, reason: 'Initial Stock' },
  { id: 'sh14', productId: 'p7', date: new Date(Date.now() - 4 * 86400000).toISOString(), change: -15, reason: 'Sale' },
  { id: 'sh15', productId: 'p8', date: new Date(Date.now() - 6 * 86400000).toISOString(), change: 120, reason: 'Initial Stock' },
  { id: 'sh16', productId: 'p8', date: new Date(Date.now() - 1 * 86400000).toISOString(), change: -40, reason: 'Sale' },
  { id: 'sh17', productId: 'p1', date: new Date(Date.now() - 1 * 86400000).toISOString(), change: -10, reason: 'Manual Adjustment', note: 'Spoiled items' },
];
