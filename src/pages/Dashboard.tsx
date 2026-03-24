import { motion } from 'motion/react';
import { TrendingUp, Package, AlertCircle, Truck, DollarSign } from 'lucide-react';
import { mockProducts, mockSales, mockDeliveries } from '../data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const lowStockProducts = mockProducts.filter(p => p.stock <= p.minStock);
  const pendingDeliveries = mockDeliveries.filter(d => d.status === 'pending');
  
  const todaySales = mockSales.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toDateString();
  }).reverse();

  const salesData = last7Days.map(date => {
    const daySales = mockSales.filter(s => new Date(s.date).toDateString() === date);
    return {
      name: date.split(' ')[0], // Day of week
      revenue: daySales.reduce((sum, s) => sum + s.total, 0)
    };
  });

  const categoryData = mockProducts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.stock;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-8 bg-zinc-50 min-h-full"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Revenue" 
          value={`$${todayRevenue.toFixed(2)}`} 
          icon={DollarSign} 
          trend="+12.5%" 
          color="emerald" 
        />
        <StatCard 
          title="Total Products" 
          value={mockProducts.length.toString()} 
          icon={Package} 
          color="blue" 
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={lowStockProducts.length.toString()} 
          icon={AlertCircle} 
          color="rose" 
          trend="Action Required"
        />
        <StatCard 
          title="Pending Deliveries" 
          value={pendingDeliveries.length.toString()} 
          icon={Truck} 
          color="amber" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h3 className="text-lg font-semibold text-zinc-800 mb-6">Revenue Overview (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h3 className="text-lg font-semibold text-zinc-800 mb-6">Inventory by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa' }} />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-800">Low Stock Items</h3>
            <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">View All</button>
          </div>
          <div className="space-y-4">
            {lowStockProducts.slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">{product.name}</p>
                    <p className="text-sm text-zinc-500">SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-rose-600">{product.stock} left</p>
                  <p className="text-xs text-rose-500">Min: {product.minStock}</p>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="text-center py-8 text-zinc-500">All stock levels are healthy!</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-800">Recent Sales</h3>
            <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">View All</button>
          </div>
          <div className="space-y-4">
            {mockSales.slice(0, 5).map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">Order #{sale.id}</p>
                    <p className="text-sm text-zinc-500">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-zinc-900">${sale.total.toFixed(2)}</p>
                  <p className="text-xs text-zinc-500 uppercase">{sale.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    rose: 'bg-rose-100 text-rose-600',
    amber: 'bg-amber-100 text-amber-600',
  }[color as string] || 'bg-zinc-100 text-zinc-600';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-zinc-900">{value}</h3>
        {trend && (
          <p className={`text-sm mt-2 font-medium ${trend.includes('+') ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trend}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
