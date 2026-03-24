import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Star, Truck, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { mockVendors, mockDeliveries } from '../data';
import { Delivery } from '../types';

export default function Vendors() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);

  const handleStatusChange = (deliveryId: string, newStatus: Delivery['status']) => {
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: newStatus } : d));
  };

  const getStatusBadge = (status: Delivery['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3" />
            Delivered
          </span>
        );
      case 'delayed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3" />
            Delayed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Truck className="w-3 h-3" />
            In Transit
          </span>
        );
    }
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-8 bg-zinc-50 min-h-full"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-800">Active Vendors</h2>
        <button className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-4 py-2 rounded-xl font-medium transition-colors shadow-sm text-sm">
          Add Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 hover:border-emerald-200 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
                {vendor.name.charAt(0)}
              </div>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-semibold">
                <Star className="w-3 h-3 fill-current" />
                {vendor.rating}
              </div>
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">{vendor.name}</h3>
            <p className="text-sm text-zinc-500 mb-4">{vendor.contactPerson}</p>
            
            <div className="space-y-2 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-400" />
                <a href={`mailto:${vendor.email}`} className="hover:text-emerald-600 truncate">{vendor.email}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-400" />
                <a href={`tel:${vendor.phone}`} className="hover:text-emerald-600">{vendor.phone}</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-800 mb-6">Deliveries</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                <th className="px-6 py-4 font-medium">Delivery ID</th>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium">Expected Date</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {deliveries.map((delivery) => {
                const vendor = mockVendors.find(v => v.id === delivery.vendorId);
                return (
                  <tr key={delivery.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-zinc-500">#{delivery.id}</td>
                    <td className="px-6 py-4 font-medium text-zinc-900">{vendor?.name}</td>
                    <td className="px-6 py-4 text-zinc-600">
                      {new Date(delivery.expectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Package className="w-4 h-4 text-zinc-400" />
                        {delivery.items.length} items
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(delivery.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={delivery.status}
                        onChange={(e) => handleStatusChange(delivery.id, e.target.value as Delivery['status'])}
                        className="px-3 py-1.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="pending">Mark Pending</option>
                        <option value="delivered">Mark Delivered</option>
                        <option value="delayed">Mark Delayed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
