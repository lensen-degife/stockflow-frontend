import { useState } from 'react';
import OrdersTable from './OrdersTable';
import InventoryTable from './InventoryTable'; // 1. Import the new table

export default function Dashboard() {
  // 2. Track the active view (defaults to 'orders')
  const [activeView, setActiveView] = useState('orders');

  return (
    <div className="flex h-screen w-full bg-gray-50 font-['Inter']">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-[240px] bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-xl font-bold">StockFlow Lite</span>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {/* 3. Update buttons to change the activeView state */}
          <button 
            onClick={() => setActiveView('orders')}
            className={`text-left px-4 py-2 rounded-md font-medium transition-colors ${activeView === 'orders' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveView('inventory')}
            className={`text-left px-4 py-2 rounded-md font-medium transition-colors ${activeView === 'inventory' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
          >
            Inventory
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-gray-800">
            {activeView === 'orders' ? 'Orders Pipeline' : 'Inventory Management'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              A
            </div>
            <span className="text-sm font-bold text-gray-700">Admin User</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {/* 4. Conditionally render the correct table */}
          {activeView === 'orders' && <OrdersTable />}
          {activeView === 'inventory' && <InventoryTable />}
        </main>
        
      </div>
    </div>
  );
}