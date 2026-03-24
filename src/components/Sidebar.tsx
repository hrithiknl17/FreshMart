import { useState } from 'react';
import { LayoutDashboard, Package, Users, Receipt, Bot, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'billing', label: 'Billing POS', icon: Receipt },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isExpanded ? 256 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-zinc-900 text-zinc-100 h-screen flex flex-col border-r border-zinc-800 relative z-20 shrink-0"
    >
      <div className="p-6 flex items-center h-20 overflow-hidden">
        <Package className="w-6 h-6 text-emerald-400 shrink-0" />
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2 whitespace-nowrap overflow-hidden"
            >
              <h1 className="text-2xl font-bold tracking-tight text-emerald-400">
                FreshSync
              </h1>
              <p className="text-xs text-zinc-400 mt-1">Grocery Management</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                isActive ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 z-10 shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium z-10 whitespace-nowrap overflow-hidden text-left flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800 overflow-hidden">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors">
          <Settings className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-medium whitespace-nowrap overflow-hidden text-left flex-1"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-2">
          <LogOut className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-medium whitespace-nowrap overflow-hidden text-left flex-1"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-24 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white rounded-full p-1 z-30 transition-colors"
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </motion.div>
  );
}
