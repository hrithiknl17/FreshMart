import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, Receipt, UserPlus, User, Tag, X, History } from 'lucide-react';
import { mockProducts, mockCustomers, mockDiscounts, mockSales } from '../data';
import { Product, Customer, Discount, Sale } from '../types';

interface CartItem extends Product {
  cartQuantity: number;
}

export default function Billing() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'upi'>('card');
  
  // Customer State
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  // Discount State
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState('');

  // Sales State
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [isCustomerHistoryModalOpen, setIsCustomerHistoryModalOpen] = useState(false);
  const [isBillHistoryModalOpen, setIsBillHistoryModalOpen] = useState(false);

  const filteredProducts = mockProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.cartQuantity + delta);
        return { ...item, cartQuantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
  
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = subtotal * (appliedDiscount.value / 100);
    } else {
      discountAmount = appliedDiscount.value;
    }
  }
  
  const tax = (subtotal - discountAmount) * 0.08; // 8% tax on discounted amount
  const total = Math.max(0, subtotal - discountAmount + tax);

  const handleApplyDiscount = () => {
    setDiscountError('');
    if (!discountCodeInput.trim()) return;
    
    const discount = mockDiscounts.find(d => d.code.toUpperCase() === discountCodeInput.trim().toUpperCase());
    
    if (!discount) {
      setDiscountError('Invalid discount code');
      return;
    }
    
    if (!discount.active) {
      setDiscountError('This discount code is expired or inactive');
      return;
    }
    
    setAppliedDiscount(discount);
    setDiscountCodeInput('');
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomer.name && newCustomer.phone) {
      const customer: Customer = {
        id: `c${Date.now()}`,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        createdAt: new Date().toISOString()
      };
      setCustomers([...customers, customer]);
      setSelectedCustomerId(customer.id);
      setIsNewCustomerModalOpen(false);
      setNewCustomer({ name: '', email: '', phone: '' });
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    const customerText = customer ? `\nCustomer: ${customer.name}` : '';
    const discountText = appliedDiscount ? `\nDiscount: ${appliedDiscount.code} (-$${discountAmount.toFixed(2)})` : '';
    
    // Create new sale record
    const newSale: Sale = {
      id: `s${Date.now()}`,
      date: new Date().toISOString(),
      items: cart.map(item => ({ productId: item.id, quantity: item.cartQuantity, price: item.price })),
      total: total,
      paymentMethod: paymentMethod,
      customerId: selectedCustomerId || undefined,
      discountCode: appliedDiscount?.code,
      discountAmount: discountAmount > 0 ? discountAmount : undefined
    };
    
    setSales([newSale, ...sales]);
    
    alert(`Checkout successful! Total: $${total.toFixed(2)} via ${paymentMethod.toUpperCase()}${customerText}${discountText}`);
    
    setCart([]);
    setAppliedDiscount(null);
    setSelectedCustomerId('');
  };

  const selectedCustomerSales = sales.filter(s => s.customerId === selectedCustomerId);

  return (
    <div className="h-full flex bg-zinc-50 overflow-hidden">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col h-full border-r border-zinc-200">
        <div className="p-6 border-b border-zinc-200 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Scan barcode or search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-100 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              autoFocus
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none appearance-none"
              >
                <option value="">Select Customer (Optional)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsNewCustomerModalOpen(true)}
              className="p-2.5 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 rounded-xl transition-colors"
              title="Add New Customer"
            >
              <UserPlus className="w-5 h-5" />
            </button>
            {selectedCustomerId && (
              <button
                onClick={() => setIsCustomerHistoryModalOpen(true)}
                className="p-2.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl transition-colors"
                title="View Purchase History"
              >
                <History className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 hover:border-emerald-500 text-left flex flex-col h-full transition-colors"
              >
                <div className="flex-1">
                  <span className="inline-block px-2 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-md mb-2 capitalize">
                    {product.category}
                  </span>
                  <h3 className="font-semibold text-zinc-900 leading-tight">{product.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">{product.sku}</p>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-lg font-bold text-emerald-600">${product.price.toFixed(2)}</span>
                  <span className="text-xs text-zinc-400">{product.stock} in stock</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-96 bg-white flex flex-col h-full shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
        <div className="p-6 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-zinc-800">Current Order</h2>
          </div>
          <button 
            onClick={() => setIsBillHistoryModalOpen(true)}
            className="p-2 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            title="View All Bills"
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4"
              >
                <Receipt className="w-12 h-12 opacity-20" />
                <p>Cart is empty</p>
              </motion.div>
            ) : (
              cart.map(item => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id} 
                  className="bg-white border border-zinc-200 p-3 rounded-xl shadow-sm flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-zinc-900 truncate text-sm">{item.name}</h4>
                    <p className="text-emerald-600 font-semibold text-sm">${(item.price * item.cartQuantity).toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-zinc-100 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-md text-zinc-600 transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-medium text-sm">{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-md text-zinc-600 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-zinc-200 bg-zinc-50 space-y-4">
          
          {/* Discount Section */}
          <div className="space-y-2">
            {!appliedDiscount ? (
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCodeInput}
                      onChange={(e) => setDiscountCodeInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none uppercase"
                    />
                  </div>
                  <button
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {discountError && <p className="text-rose-500 text-xs mt-1">{discountError}</p>}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-medium">{appliedDiscount.code}</span>
                  <span className="text-xs bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-800">
                    {appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}% OFF` : `$${appliedDiscount.value} OFF`}
                  </span>
                </div>
                <button onClick={handleRemoveDiscount} className="text-emerald-600 hover:text-emerald-800 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm pt-2 border-t border-zinc-200">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-zinc-900 pt-2 border-t border-zinc-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4">
            <button 
              onClick={() => setPaymentMethod('card')}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'card' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'}`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs font-medium">Card</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('cash')}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'}`}
            >
              <Banknote className="w-5 h-5" />
              <span className="text-xs font-medium">Cash</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('upi')}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'upi' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'}`}
            >
              <QrCode className="w-5 h-5" />
              <span className="text-xs font-medium">UPI</span>
            </button>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-sm shadow-emerald-600/20"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* New Customer Modal */}
      <AnimatePresence>
        {isNewCustomerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-zinc-800">Add New Customer</h2>
                <button onClick={() => setIsNewCustomerModalOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="555-0123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewCustomerModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
                  >
                    Save Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Customer History Modal */}
      <AnimatePresence>
        {isCustomerHistoryModalOpen && selectedCustomerId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-zinc-800">
                  Purchase History: {customers.find(c => c.id === selectedCustomerId)?.name}
                </h2>
                <button onClick={() => setIsCustomerHistoryModalOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {selectedCustomerSales.length === 0 ? (
                  <div className="text-center text-zinc-500 py-8">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No purchase history found for this customer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCustomerSales.map(sale => (
                      <div key={sale.id} className="border border-zinc-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-zinc-900">{new Date(sale.date).toLocaleString()}</p>
                            <p className="text-sm text-zinc-500">Order ID: {sale.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">${sale.total.toFixed(2)}</p>
                            <p className="text-xs text-zinc-500 uppercase">{sale.paymentMethod}</p>
                          </div>
                        </div>
                        <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
                          {sale.items.map((item, idx) => {
                            const product = mockProducts.find(p => p.id === item.productId);
                            return (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-zinc-700">{item.quantity}x {product?.name || 'Unknown Item'}</span>
                                <span className="text-zinc-500">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            );
                          })}
                          {sale.discountAmount && sale.discountAmount > 0 && (
                            <div className="flex justify-between text-sm pt-2 border-t border-zinc-200 text-emerald-600">
                              <span>Discount ({sale.discountCode})</span>
                              <span>-${sale.discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bill History Modal */}
      <AnimatePresence>
        {isBillHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-zinc-800">
                  All Bill History
                </h2>
                <button onClick={() => setIsBillHistoryModalOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {sales.length === 0 ? (
                  <div className="text-center text-zinc-500 py-8">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No bills found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sales.map(sale => {
                      const customer = customers.find(c => c.id === sale.customerId);
                      return (
                        <div key={sale.id} className="border border-zinc-200 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-zinc-900">{new Date(sale.date).toLocaleString()}</p>
                              <p className="text-sm text-zinc-500">Order ID: {sale.id}</p>
                              {customer && <p className="text-sm text-emerald-600 mt-1">Customer: {customer.name}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600">${sale.total.toFixed(2)}</p>
                              <p className="text-xs text-zinc-500 uppercase">{sale.paymentMethod}</p>
                            </div>
                          </div>
                          <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
                            {sale.items.map((item, idx) => {
                              const product = mockProducts.find(p => p.id === item.productId);
                              return (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-zinc-700">{item.quantity}x {product?.name || 'Unknown Item'}</span>
                                  <span className="text-zinc-500">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              );
                            })}
                            {sale.discountAmount && sale.discountAmount > 0 && (
                              <div className="flex justify-between text-sm pt-2 border-t border-zinc-200 text-emerald-600">
                                <span>Discount ({sale.discountCode})</span>
                                <span>-${sale.discountAmount.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
