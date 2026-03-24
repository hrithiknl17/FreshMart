import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Filter, Edit, Trash2, X, Tags, CheckSquare, Square, ChevronDown, Image as ImageIcon, Upload, AlertTriangle, CheckCircle, Sparkles, Loader2, History } from 'lucide-react';
import { mockProducts, mockStockHistory } from '../data';
import { Product, StockHistoryEntry } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'success';
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'expiryAsc' | 'expiryDesc'>('name');
  
  // Modal states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Custom categories state
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Bulk action state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [bulkActionType, setBulkActionType] = useState<'stock' | 'price' | 'category' | null>(null);
  const [bulkActionValue, setBulkActionValue] = useState<string | number>('');

  // New product state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', sku: '', category: 'produce', price: 0, stock: 0, minStock: 0, cost: 0, vendorId: 'v1', imageUrl: '', expiryDate: ''
  });

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Stock history state
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>(mockStockHistory);
  const [selectedHistoryProduct, setSelectedHistoryProduct] = useState<Product | null>(null);

  // AI generation state
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'warning' | 'success' = 'warning') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const allCategories = Array.from(new Set([...products.map(p => p.category), ...customCategories]));
  const filterCategories = ['all', ...allCategories];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    
    // For expiry sorting, push items without expiry dates to the bottom
    if (!a.expiryDate && !b.expiryDate) return a.name.localeCompare(b.name);
    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;
    
    const dateA = new Date(a.expiryDate).getTime();
    const dateB = new Date(b.expiryDate).getTime();
    
    if (sortBy === 'expiryAsc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim().toLowerCase();
    if (trimmed && !allCategories.includes(trimmed)) {
      setCustomCategories([...customCategories, trimmed]);
      setNewCategoryName('');
      setIsAddCategoryOpen(false);
      setNewProduct(prev => ({ ...prev, category: trimmed }));
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.sku && newProduct.category) {
      const productToAdd: Product = {
        id: `p${Date.now()}`,
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        price: Number(newProduct.price),
        cost: Number(newProduct.cost),
        stock: Number(newProduct.stock),
        minStock: Number(newProduct.minStock),
        vendorId: newProduct.vendorId || 'v1',
        imageUrl: newProduct.imageUrl,
        expiryDate: newProduct.expiryDate || undefined
      };
      setProducts([productToAdd, ...products]);
      
      // Add initial stock history
      if (productToAdd.stock > 0) {
        setStockHistory(prev => [{
          id: `sh${Date.now()}`,
          productId: productToAdd.id,
          date: new Date().toISOString(),
          change: productToAdd.stock,
          reason: 'Initial Stock'
        }, ...prev]);
      }

      setIsAddProductOpen(false);
      setNewProduct({ name: '', sku: '', category: allCategories[0] || '', price: 0, stock: 0, minStock: 0, cost: 0, vendorId: 'v1', imageUrl: '', expiryDate: '' });
      
      if (productToAdd.stock <= productToAdd.minStock) {
        addNotification(`Alert: ${productToAdd.name} was added with low stock!`, 'warning');
      } else {
        addNotification(`Successfully added ${productToAdd.name}`, 'success');
      }
    }
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct.name && editingProduct.sku && editingProduct.category) {
      const originalProduct = products.find(p => p.id === editingProduct.id);
      
      if (originalProduct && originalProduct.stock !== editingProduct.stock) {
        const diff = editingProduct.stock - originalProduct.stock;
        setStockHistory(prev => [{
          id: `sh${Date.now()}`,
          productId: editingProduct.id,
          date: new Date().toISOString(),
          change: diff,
          reason: 'Manual Adjustment',
          note: 'Updated via edit product'
        }, ...prev]);
      }

      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      setIsEditProductOpen(false);
      
      if (editingProduct.stock <= editingProduct.minStock) {
        addNotification(`Alert: ${editingProduct.name} was updated with low stock!`, 'warning');
      } else {
        addNotification(`Successfully updated ${editingProduct.name}`, 'success');
      }
      setEditingProduct(null);
    }
  };

  const generateImage = async (productName: string, productCategory: string, isEditing: boolean) => {
    if (!productName) {
      addNotification('Please enter a product name first to generate an image.', 'warning');
      return;
    }
    
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `A professional product photography shot of a ${productName}, category: ${productCategory || 'general'}. Clean white background, studio lighting, high quality, centered.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });
      
      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }
      
      if (imageUrl) {
        if (isEditing && editingProduct) {
          setEditingProduct({ ...editingProduct, imageUrl });
        } else {
          setNewProduct(prev => ({ ...prev, imageUrl }));
        }
        addNotification('Image generated successfully!', 'success');
      } else {
        addNotification('Failed to generate image. Please try again.', 'warning');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      addNotification('Error generating image. Check your API key.', 'warning');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing && editingProduct) {
          setEditingProduct({ ...editingProduct, imageUrl: reader.result as string });
        } else {
          setNewProduct(prev => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        let importedProducts: Product[] = [];
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          importedProducts = (Array.isArray(parsed) ? parsed : [parsed]).map((p: any) => ({
            id: p.id || `p${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            name: p.name || 'Unknown Product',
            sku: p.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
            category: p.category || 'general',
            price: Number(p.price) || 0,
            cost: Number(p.cost) || 0,
            stock: Number(p.stock) || 0,
            minStock: Number(p.minStock) || 0,
            vendorId: p.vendorId || 'v1',
            imageUrl: p.imageUrl || ''
          }));
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter(line => line.trim());
          if (lines.length > 1) {
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            importedProducts = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim());
              const product: any = {};
              headers.forEach((h, i) => {
                product[h] = values[i];
              });
              return {
                id: `p${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
                name: product.name || 'Unknown Product',
                sku: product.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
                category: product.category || 'general',
                price: Number(product.price) || 0,
                cost: Number(product.cost) || 0,
                stock: Number(product.stock) || 0,
                minStock: Number(product.minstock || product['min stock']) || 0,
                vendorId: product.vendorid || product['vendor id'] || 'v1',
                imageUrl: product.imageurl || product['image url'] || ''
              };
            });
          }
        }

        if (importedProducts.length > 0) {
          setProducts(prev => [...importedProducts, ...prev]);
          
          // Add initial stock history for imported products
          const newHistoryEntries = importedProducts
            .filter(p => p.stock > 0)
            .map(p => ({
              id: `sh${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
              productId: p.id,
              date: new Date().toISOString(),
              change: p.stock,
              reason: 'Initial Stock' as const,
              note: 'Imported via CSV/JSON'
            }));
            
          if (newHistoryEntries.length > 0) {
            setStockHistory(prev => [...newHistoryEntries, ...prev]);
          }
          
          const newCats = new Set(importedProducts.map(p => p.category.toLowerCase()));
          const currentCats = new Set(allCategories.map(c => c.toLowerCase()));
          const uniqueNewCats = Array.from(newCats).filter(c => !currentCats.has(c));
          if (uniqueNewCats.length > 0) {
            setCustomCategories(prev => [...prev, ...uniqueNewCats]);
          }
          
          setIsImportModalOpen(false);
          
          const lowStockCount = importedProducts.filter(p => p.stock <= p.minStock).length;
          if (lowStockCount > 0) {
            addNotification(`Alert: ${lowStockCount} imported products are low on stock!`, 'warning');
          }
          addNotification(`Successfully migrated ${importedProducts.length} products!`, 'success');
        } else {
          addNotification('No valid products found in the file.', 'warning');
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        addNotification('Error parsing file. Please check the format.', 'warning');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.size === filteredProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProductIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProductIds(newSelected);
  };

  const handleBulkAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkActionType || bulkActionValue === '') return;

    let lowStockAlerts: string[] = [];
    const newHistoryEntries: StockHistoryEntry[] = [];

    setProducts(prevProducts => prevProducts.map(p => {
      if (selectedProductIds.has(p.id)) {
        if (bulkActionType === 'stock') {
          const newStock = Number(bulkActionValue);
          if (newStock <= p.minStock && p.stock > p.minStock) {
            lowStockAlerts.push(p.name);
          }
          
          if (newStock !== p.stock) {
            newHistoryEntries.push({
              id: `sh${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
              productId: p.id,
              date: new Date().toISOString(),
              change: newStock - p.stock,
              reason: 'Manual Adjustment',
              note: 'Bulk stock update'
            });
          }
          
          return { ...p, stock: newStock };
        }
        if (bulkActionType === 'price') return { ...p, price: Number(bulkActionValue) };
        if (bulkActionType === 'category') return { ...p, category: String(bulkActionValue) };
      }
      return p;
    }));

    if (newHistoryEntries.length > 0) {
      setStockHistory(prev => [...newHistoryEntries, ...prev]);
    }

    if (lowStockAlerts.length > 0) {
      if (lowStockAlerts.length === 1) {
        addNotification(`Alert: ${lowStockAlerts[0]} has dropped below minimum stock!`, 'warning');
      } else {
        addNotification(`Alert: ${lowStockAlerts.length} products have dropped below minimum stock!`, 'warning');
      }
    } else {
      addNotification(`Successfully updated ${selectedProductIds.size} products.`, 'success');
    }

    setIsBulkEditModalOpen(false);
    setSelectedProductIds(new Set());
    setBulkActionType(null);
    setBulkActionValue('');
  };

  const openBulkEditModal = (type: 'stock' | 'price' | 'category') => {
    setBulkActionType(type);
    setBulkActionValue('');
    setIsBulkEditModalOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-zinc-50 min-h-full relative"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex gap-4 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none w-full sm:w-64 shadow-sm"
          />
          <div className="relative">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none shadow-sm capitalize"
            >
              {filterCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none shadow-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="expiryAsc">Expiry (Earliest)</option>
              <option value="expiryDesc">Expiry (Latest)</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
          >
            <Upload className="w-5 h-5" />
            Migrate Data
          </button>
          <button 
            onClick={() => setIsAddCategoryOpen(true)}
            className="flex items-center gap-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
          >
            <Tags className="w-5 h-5" />
            Add Category
          </button>
          <button 
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-emerald-600/20 w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      <AnimatePresence>
        {selectedProductIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-zinc-800 text-white px-6 py-3 rounded-xl shadow-lg mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="font-medium bg-zinc-700 px-2.5 py-1 rounded-lg text-sm">
                {selectedProductIds.size} selected
              </span>
              <span className="text-zinc-400 text-sm">Perform bulk action:</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => openBulkEditModal('stock')}
                className="px-3 py-1.5 text-sm font-medium bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
              >
                Update Stock
              </button>
              <button 
                onClick={() => openBulkEditModal('price')}
                className="px-3 py-1.5 text-sm font-medium bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
              >
                Update Price
              </button>
              <button 
                onClick={() => openBulkEditModal('category')}
                className="px-3 py-1.5 text-sm font-medium bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
              >
                Change Category
              </button>
              <div className="w-px h-6 bg-zinc-700 mx-2"></div>
              <button 
                onClick={() => setSelectedProductIds(new Set())}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                <th className="px-6 py-4 font-medium w-12">
                  <button onClick={toggleSelectAll} className="text-zinc-400 hover:text-emerald-600 transition-colors">
                    {selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Price</th>
                <th className="px-6 py-4 font-medium text-right">Stock</th>
                <th className="px-6 py-4 font-medium text-center">Expiry Date</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.map((product) => {
                const isSelected = selectedProductIds.has(product.id);
                
                // Expiry logic
                let expiryStatus = 'none'; // none, soon, expired
                let expiryText = 'N/A';
                if (product.expiryDate) {
                  const expDate = new Date(product.expiryDate);
                  const today = new Date();
                  const diffTime = expDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  expiryText = expDate.toLocaleDateString();
                  
                  if (diffDays < 0) {
                    expiryStatus = 'expired';
                  } else if (diffDays <= 30) {
                    expiryStatus = 'soon';
                  }
                }

                return (
                  <tr key={product.id} className={`hover:bg-zinc-50/50 transition-colors group ${isSelected ? 'bg-emerald-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleSelectProduct(product.id)} className="text-zinc-400 hover:text-emerald-600 transition-colors">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-8 h-8 rounded-lg object-cover border border-zinc-200 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center border border-zinc-200 shrink-0">
                            <ImageIcon className="w-4 h-4 text-zinc-400" />
                          </div>
                        )}
                        <p className="font-medium text-zinc-900">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500 font-mono">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-900">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-medium ${product.stock <= product.minStock ? 'text-rose-600' : 'text-zinc-900'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.expiryDate ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          expiryStatus === 'expired' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          expiryStatus === 'soon' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-zinc-100 text-zinc-800'
                        }`}>
                          {expiryStatus === 'expired' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {expiryText}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.stock <= product.minStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setSelectedHistoryProduct(product);
                            setIsHistoryModalOpen(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Stock History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingProduct(product);
                            setIsEditProductOpen(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setProducts(prev => prev.filter(p => p.id !== product.id));
                            addNotification(`Deleted ${product.name}`, 'success');
                          }}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              No products found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Bulk Edit Modal */}
      <AnimatePresence>
        {isBulkEditModalOpen && bulkActionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                <h3 className="text-lg font-semibold text-zinc-900">
                  Bulk Update {bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1)}
                </h3>
                <button onClick={() => setIsBulkEditModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBulkAction} className="p-6 space-y-4">
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 mb-4">
                  <p className="text-sm text-zinc-600">
                    Updating <span className="font-bold text-zinc-900">{selectedProductIds.size}</span> selected products.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    New {bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1)}
                  </label>
                  
                  {bulkActionType === 'category' ? (
                    <div className="relative">
                      <select
                        required
                        value={bulkActionValue as string}
                        onChange={(e) => setBulkActionValue(e.target.value)}
                        className="w-full appearance-none px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none capitalize"
                      >
                        <option value="" disabled>Select category</option>
                        {allCategories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type="number"
                      step={bulkActionType === 'price' ? "0.01" : "1"}
                      min="0"
                      required
                      value={bulkActionValue}
                      onChange={(e) => setBulkActionValue(e.target.value)}
                      placeholder={`Enter new ${bulkActionType}...`}
                      className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                  )}
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsBulkEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
                  >
                    Apply to {selectedProductIds.size} items
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        {isAddCategoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                <h3 className="text-lg font-semibold text-zinc-900">Add New Category</h3>
                <button onClick={() => setIsAddCategoryOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddCategory} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., snacks, cleaning supplies"
                    className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddProductOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-100 shrink-0">
                <h3 className="text-lg font-semibold text-zinc-900">Add New Product</h3>
                <button onClick={() => setIsAddProductOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="add-product-form" onSubmit={handleAddProduct} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Product Image</label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {newProduct.imageUrl ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                            <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewProduct({ ...newProduct, imageUrl: '' })}
                              className="absolute top-0 right-0 p-1 bg-white/80 text-rose-600 hover:bg-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50 shrink-0">
                            <ImageIcon className="w-6 h-6 text-zinc-400" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                          className="block w-full sm:w-auto text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => generateImage(newProduct.name || '', newProduct.category || '', false)}
                          disabled={isGeneratingImage || !newProduct.name}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          Generate with AI
                        </button>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Product Name</label>
                      <input
                        type="text"
                        required
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">SKU</label>
                      <input
                        type="text"
                        required
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                      <div className="flex gap-2">
                        <select
                          required
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none capitalize"
                        >
                          <option value="" disabled>Select category</option>
                          {allCategories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsAddCategoryOpen(true)}
                          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                          title="Add new category"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Selling Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={newProduct.price || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Cost Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={newProduct.cost || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, cost: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Initial Stock</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={newProduct.stock || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Minimum Stock Alert</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={newProduct.minStock || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, minStock: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Expiry Date (Optional)</label>
                      <input
                        type="date"
                        value={newProduct.expiryDate || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-zinc-100 shrink-0 bg-zinc-50">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-product-form"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
                >
                  Save Product
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {isEditProductOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-100 shrink-0">
                <h3 className="text-lg font-semibold text-zinc-900">Edit Product</h3>
                <button onClick={() => setIsEditProductOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="edit-product-form" onSubmit={handleEditProduct} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Product Image</label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {editingProduct.imageUrl ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                            <img src={editingProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                              className="absolute top-0 right-0 p-1 bg-white/80 text-rose-600 hover:bg-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50 shrink-0">
                            <ImageIcon className="w-6 h-6 text-zinc-400" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="block w-full sm:w-auto text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => generateImage(editingProduct.name || '', editingProduct.category || '', true)}
                          disabled={isGeneratingImage || !editingProduct.name}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          Generate with AI
                        </button>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Product Name</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">SKU</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.sku}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                      <div className="flex gap-2">
                        <select
                          required
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none capitalize"
                        >
                          <option value="" disabled>Select category</option>
                          {allCategories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsAddCategoryOpen(true)}
                          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                          title="Add new category"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Selling Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={editingProduct.price || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Cost Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={editingProduct.cost || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, cost: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Stock</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={editingProduct.stock || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Minimum Stock Alert</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={editingProduct.minStock || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, minStock: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Expiry Date (Optional)</label>
                      <input
                        type="date"
                        value={editingProduct.expiryDate || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, expiryDate: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-zinc-100 shrink-0 bg-zinc-50">
                <button
                  type="button"
                  onClick={() => setIsEditProductOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-product-form"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                <h3 className="text-lg font-semibold text-zinc-900">Migrate Products</h3>
                <button onClick={() => setIsImportModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-600">
                  Upload a CSV or JSON file from your old system to migrate products. 
                  Expected columns/keys: <code className="bg-zinc-100 px-1 py-0.5 rounded">name, sku, category, price, cost, stock, minStock</code>.
                </p>
                
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:bg-zinc-50 transition-colors relative">
                  <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-zinc-700 mb-1">Click to upload file</p>
                  <p className="text-xs text-zinc-500">CSV or JSON up to 5MB</p>
                  <input 
                    type="file" 
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stock History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedHistoryProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">Stock History</h3>
                  <p className="text-sm text-zinc-500">{selectedHistoryProduct.name} ({selectedHistoryProduct.sku})</p>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {stockHistory.filter(h => h.productId === selectedHistoryProduct.id).length === 0 ? (
                  <div className="text-center text-zinc-500 py-8">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No stock history found for this product.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stockHistory
                      .filter(h => h.productId === selectedHistoryProduct.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(history => (
                        <div key={history.id} className="border border-zinc-200 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-zinc-900">{new Date(history.date).toLocaleString()}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium text-zinc-700">{history.reason}</span>
                              {history.note && (
                                <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                                  {history.note}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`text-lg font-bold ${history.change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {history.change > 0 ? '+' : ''}{history.change}
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

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
                notif.type === 'warning' 
                  ? 'bg-rose-50 border-rose-200 text-rose-800' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {notif.type === 'warning' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
              <p className="text-sm font-medium">{notif.message}</p>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
