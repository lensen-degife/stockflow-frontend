import { useState, useEffect } from 'react';
import AdjustStockModal from './AdjustStockModal';

export default function InventoryTable() {
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

    const fetchInventory = async () => {
        try {
            const token = localStorage.getItem('token');
            const orgId = localStorage.getItem('organization_id') || '';

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inventory?organization_id=${orgId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Failed to fetch inventory');
            setInventory(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-bold">Loading inventory...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
                <h2 className="text-lg font-bold text-gray-800">Current Stock Levels</h2>
                <button
                    onClick={() => setIsAdjustModalOpen(true)}
                    className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-md text-sm font-bold transition-colors"
                >
                    Adjust Stock
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                            <th className="px-6 py-4 font-bold">Product ID / SKU</th>
                            <th className="px-6 py-4 font-bold">Warehouse</th>
                            <th className="px-6 py-4 font-bold">Available Qty</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {inventory.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No inventory records found.</td>
                            </tr>
                        ) : (
                            inventory.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.product_id || item.sku}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.warehouse_id || item.warehouse_name}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.quantity}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.quantity > 20 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {item.quantity > 20 ? 'IN STOCK' : 'LOW STOCK'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AdjustStockModal
                isOpen={isAdjustModalOpen}
                onClose={() => setIsAdjustModalOpen(false)}
                onStockAdjusted={fetchInventory}
            />
        </div>
    );
}