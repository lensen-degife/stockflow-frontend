import { useState } from 'react';
import OrderDrawer from './OrderDrawer';

export default function OrdersTable() {
    // State to track which order is clicked, and if the drawer is open
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const dummyOrders = [
        { id: 'ORD-9021', customer: 'Sarah Connor', items: 3, total: '$420.00', status: 'RESERVED' },
        { id: 'ORD-9022', customer: 'John Smith', items: 1, total: '$150.00', status: 'CONFIRMED' },
        { id: 'ORD-9023', customer: 'Acme Corp', items: 12, total: '$2,400.00', status: 'DRAFT' },
    ];

    const getStatusBadge = (status) => {
        const styles = {
            DRAFT: 'bg-gray-100 text-gray-700',
            RESERVED: 'bg-yellow-100 text-yellow-700',
            CONFIRMED: 'bg-emerald-100 text-emerald-700',
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

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');

            // Adjust this URL and Method to match your existing backend route
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            // 1. Update the table data instantly
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            // 2. Update the drawer data so the buttons change instantly
            setSelectedOrder(prev => ({ ...prev, status: newStatus }));

        } catch (err) {
            alert(err.message); // In a real app, use a toast notification here
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="w-64 h-9 px-3 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-bold transition-colors">
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
                        <tbody className="divide-y divide-gray-200">
                            {dummyOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    onClick={() => handleRowClick(order)} // Click handler added here
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{order.items}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.total}</td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(order.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
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
        </>
    );
}