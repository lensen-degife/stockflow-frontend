import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrdersTable from './OrdersTable';
import InventoryTable from './InventoryTable';
import OrganizationModal from './OrganizationModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('orders');
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(() => ({
    id: localStorage.getItem('organization_id') || '',
    name: localStorage.getItem('organization_name') || '',
  }));

  const handleOrgSaved = (org) => {
    setCurrentOrg({
      id: org.id,
      name: org.name || org.id,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('organization_id');
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 font-['Inter']">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-[240px] bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-xl font-bold">StockFlow Lite</span>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveView('orders')}
            className={`text-left px-4 py-2 rounded-md font-medium transition-colors cursor-pointer ${activeView === 'orders' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveView('inventory')}
            className={`text-left px-4 py-2 rounded-md font-medium transition-colors cursor-pointer ${activeView === 'inventory' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
          >
            Inventory
          </button>
          <button 
            onClick={handleLogout}
            className="mt-auto text-left px-4 py-2 rounded-md font-medium transition-colors cursor-pointer hover:bg-gray-800 text-gray-300"
          >
            Log Out
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-gray-800">
            {activeView === 'orders' ? 'Orders Pipeline' : 'Inventory Management'}
          </h1>
          <div className="flex items-center gap-4">
            {currentOrg.id ? (
              <button
                onClick={() => setIsOrgModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                title={`Active Org ID: ${currentOrg.id}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{currentOrg.name || `${currentOrg.id.slice(0, 8)}...`}</span>
                <span className="text-blue-400 text-[10px]">⚙️</span>
              </button>
            ) : (
              <button
                onClick={() => setIsOrgModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-md text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <span>⚠️ Set Organization</span>
              </button>
            )}

            <div className="h-5 w-[1px] bg-gray-200"></div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                A
              </div>
              <span className="text-sm font-bold text-gray-700">Admin User</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {activeView === 'orders' && (
            <OrdersTable 
              onOpenOrgModal={() => setIsOrgModalOpen(true)}
              activeOrgId={currentOrg.id}
            />
          )}
          {activeView === 'inventory' && (
            <InventoryTable 
              activeOrgId={currentOrg.id}
            />
          )}
        </main>
        
        <OrganizationModal
          isOpen={isOrgModalOpen}
          onClose={() => setIsOrgModalOpen(false)}
          onOrganizationSaved={handleOrgSaved}
        />
      </div>
    </div>
  );
}