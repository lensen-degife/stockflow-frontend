import { useState } from "react";
import OrdersTable from "./OrdersTable";
import OrganizationModal from "./OrganizationModal";

export default function Dashboard() {
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

    return (
        // The main wrapper: Full screen, Flex row to put sidebar next to content
        <div className="flex h-screen w-full bg-gray-50 font-['Inter']">

            {/* LEFT SIDEBAR (240px wide, dark theme) */}
            <aside className="w-[240px] bg-gray-900 text-white flex flex-col">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <span className="text-xl font-bold">StockFlow Lite</span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 flex flex-col gap-2">
                    <button className="text-left px-4 py-2 bg-blue-600 rounded-md font-medium text-white">
                        Dashboard
                    </button>
                    <button className="text-left px-4 py-2 hover:bg-gray-800 rounded-md font-medium text-gray-300 transition-colors">
                        Orders
                    </button>
                    <button className="text-left px-4 py-2 hover:bg-gray-800 rounded-md font-medium text-gray-300 transition-colors">
                        Inventory
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT AREA (Takes up remaining space) */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* TOP HEADER (64px tall, white) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
                    <h1 className="text-xl font-bold text-gray-800">Dashboard Overview</h1>

                    <div className="flex items-center gap-4">
                        {/* Organization Indicator / Selector */}
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

                        {/* Admin User Badge */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                A
                            </div>
                            <span className="text-sm font-bold text-gray-700">Admin User</span>
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT (Where the tables will go) */}
                <main className="flex-1 overflow-auto p-8">
                    <OrdersTable
                        onOpenOrgModal={() => setIsOrgModalOpen(true)}
                        activeOrgId={currentOrg.id}
                    />
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