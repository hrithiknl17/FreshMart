/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Vendors from './pages/Vendors';
import Billing from './pages/Billing';
import Assistant from './pages/Assistant';
import LandingPage from './pages/LandingPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'vendors':
        return <Vendors />;
      case 'billing':
        return <Billing />;
      case 'assistant':
        return <Assistant />;
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'inventory': return 'Inventory Management';
      case 'vendors': return 'Vendors & Deliveries';
      case 'billing': return 'Point of Sale';
      case 'assistant': return 'AI Assistant';
      default: return 'FreshSync';
    }
  };

  if (!isAuthenticated) {
    return <LandingPage onSignIn={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-zinc-100 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header title={getTitle()} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

