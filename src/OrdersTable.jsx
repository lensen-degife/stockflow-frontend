import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import OrderDrawer from './OrderDrawer';
import CreateOrderModal from './CreateOrderModal';
import TableSkeleton from './TableSkeleton';

export default function OrdersTable({ onOpenOrgModal, activeOrgId }) {
    // State to track which order is clicked, and if the drawer is open
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusBadge = (status) => {
        const styles = {
            DRAFT: 'bg-gray-100 text-gray-700',
            RESERVED: 'bg-yellow-100 text-yellow-700',
            CONFIRMED: 'bg-emerald-100 text-emerald-700',
            FULFILLED: 'bg-purple-100 text-purple-700',
            CANCELLED: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    // Function to handle clicking a row
    const handleRowClick = (order) => {
        setSelectedOrder(order);
        setIsDrawerOpen(true);
    };

    // We pass both the API action route and the new resulting status
    const handleUpdateStatus = async (orderId, action, newStatus) => {
        try {
            const orgId = activeOrgId || localStorage.getItem('organization_id');

            if (!orgId) {
                toast.error('No active organization selected! Please set or create an organization first.');
                if (onOpenOrgModal) onOpenOrgModal();
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/orders/${orderId}/${action}?organization_id=${orgId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || `Failed to ${action} order`);
            }

            // 1. Update the table data instantly
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );

            // 2. Update the drawer data so the buttons change instantly
            setSelectedOrder(prev => (prev ? { ...prev, status: newStatus } : null));

            toast.success('Status updated!');

            // 3. Re-fetch from database to keep in sync
            fetchOrders();

        } catch (err) {
            toast.error(err.message);
        }
    };

    const fetchOrders = useCallback(async (newOrder) => {
        try {
            setIsLoading(true);
            const orgId = activeOrgId || localStorage.getItem('organization_id');
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const url = orgId
                ? `${import.meta.env.VITE_API_URL}/api/v1/orders?organization_id=${orgId}`
                : `${import.meta.env.VITE_API_URL}/api/v1/orders`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const fetchedOrders = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
                setOrders(
                    fetchedOrders.map((order) => ({
                        id: order.id,
                        customer: order.customer_name || (order.customer_id ? `${order.customer_id.slice(0, 8)}...` : 'Customer'),
                        items: Number(order.items_count ?? (Array.isArray(order.items) ? order.items.length : 1)),
                        total: `$${Number(order.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        status: order.status || 'DRAFT',
                    }))
                );
            } else if (newOrder && newOrder.id) {
                setOrders((prev) => [
                    {
                        id: newOrder.id,
                        customer: newOrder.customer_name || (newOrder.customer_id ? `${newOrder.customer_id.slice(0, 8)}...` : 'Customer'),
                        items: Number(newOrder.items_count ?? (Array.isArray(newOrder.items) ? newOrder.items.length : 1)),
                        total: `$${Number(newOrder.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        status: newOrder.status || 'DRAFT',
                    },
                    ...prev,
                ]);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            toast.error(err.message);
            if (newOrder && newOrder.id) {
                setOrders((prev) => [
                    {
                        id: newOrder.id,
                        customer: newOrder.customer_name || (newOrder.customer_id ? `${newOrder.customer_id.slice(0, 8)}...` : 'Customer'),
                        items: Number(newOrder.items_count ?? (Array.isArray(newOrder.items) ? newOrder.items.length : 1)),
                        total: `$${Number(newOrder.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        status: newOrder.status || 'DRAFT',
                    },
                    ...prev,
                ]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [activeOrgId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = orders.filter((order) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            order.id?.toLowerCase().includes(q) ||
            order.customer?.toLowerCase().includes(q) ||
            order.status?.toLowerCase().includes(q)
        );
    });

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 h-9 px-3 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-bold transition-colors cursor-pointer"
                    >
                        + Create Order
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                                <th className="px-6 py-4 font-bold">Order ID</th>
                                <th className="px-6 py-4 font-bold">Customer</th>
                                <th className="px-6 py-4 font-bold">Items</th>
                                <th className="px-6 py-4 font-bold">Total</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                            </tr>
                        </thead>
                        {isLoading ? (
                            <TableSkeleton columns={5} />
                        ) : (
                            <tbody className="divide-y divide-gray-200">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                            {searchQuery ? 'No orders match your search.' : 'No orders found in database. Click "+ Create Order" to place your first order.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            onClick={() => handleRowClick(order)}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 font-mono" title={order.id}>
                                                {order.id.length > 13 ? `${order.id.slice(0, 8)}...` : order.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{order.items}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.total}</td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(order.status)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            {/* The Drawer component injected into the page */}
            <OrderDrawer
                isOpen={isDrawerOpen}
                order={selectedOrder}
                onClose={() => setIsDrawerOpen(false)}
                onUpdateStatus={handleUpdateStatus} // Pass the function here!
            />
            <CreateOrderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onOrderCreated={fetchOrders}
            />
        </>
    );
}