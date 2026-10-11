import { useState } from 'react';
import OrderDrawer from './OrderDrawer';

export default function OrdersTable({ onOpenOrgModal, activeOrgId }) {
    // State to track which order is clicked, and if the drawer is open
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [orders, setOrders] = useState([
        { id: 'ORD-9021', customer: 'Sarah Connor', items: 3, total: '$420.00', status: 'RESERVED' },
        { id: 'ORD-9022', customer: 'John Smith', items: 1, total: '$150.00', status: 'CONFIRMED' },
        { id: 'ORD-9023', customer: 'Acme Corp', items: 12, total: '$2,400.00', status: 'DRAFT' },
    ]);

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

    // We pass both the API action route and the new resulting status
  const handleUpdateStatus = async (orderId, action, newStatus) => {
    try {
      const orgId = activeOrgId || localStorage.getItem('organization_id');

      if (!orgId) {
        alert('No active organization selected! Please set or create an organization first.');
        if (onOpenOrgModal) onOpenOrgModal();
        return;
      }

      const token = localStorage.getItem('token');
      // Backend order IDs must be UUIDs; dummy demo orders (e.g. ORD-9023) update locally
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId);

      if (isUUID) {
        // Calls POST /api/v1/orders/:orderId/:action?organization_id=<ORG_UUID>
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
      }

      // 1. Update the table data instantly
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // 2. Update the drawer data so the buttons change instantly
      setSelectedOrder(prev => (prev ? { ...prev, status: newStatus } : null));

    } catch (err) {
      alert(err.message); 
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
                            {orders.map((order) => (
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