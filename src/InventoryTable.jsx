import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import AdjustStockModal from './AdjustStockModal';
import TableSkeleton from './TableSkeleton';

export default function InventoryTable({ activeOrgId }) {
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

    const fetchInventory = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const orgId = activeOrgId || localStorage.getItem('organization_id') || '';

            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inventory?organization_id=${orgId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to fetch inventory');
            }
            setInventory(data.data || []);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [activeOrgId]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
                <h2 className="text-lg font-bold text-gray-800">Current Stock Levels</h2>
                <button
                    onClick={() => setIsAdjustModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-bold transition-colors cursor-pointer"
                >
                    + Adjust Stock
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-b border-red-200 text-red-600 text-sm font-semibold">
                    Error loading inventory: {error}
                </div>
            )}

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
                    {isLoading ? (
                        <TableSkeleton columns={4} />
                    ) : (
                        <tbody className="divide-y divide-gray-200">
                            {inventory.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500 font-medium">
                                        No inventory records found. Click "+ Adjust Stock" to add inventory.
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            <div>{item.sku || item.product_id}</div>
                                            {item.product_name && (
                                                <div className="text-xs text-gray-500 font-normal">{item.product_name}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.warehouse_name || item.warehouse_id}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.quantity}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${Number(item.quantity) > 20 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {Number(item.quantity) > 20 ? 'IN STOCK' : 'LOW STOCK'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    )}
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