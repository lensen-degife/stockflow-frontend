import { useState, useEffect } from 'react';

export default function SummaryCards({ activeOrgId }) {
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    lowStockItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const orgId = activeOrgId || localStorage.getItem('organization_id') || '';

        if (!token) {
          setIsLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const ordersUrl = orgId
          ? `${import.meta.env.VITE_API_URL}/api/v1/orders?organization_id=${orgId}`
          : `${import.meta.env.VITE_API_URL}/api/v1/orders`;

        const lowStockUrl = `${import.meta.env.VITE_API_URL}/api/v1/reports/low-stock?organization_id=${orgId}&threshold=20`;

        const [ordersRes, lowStockRes] = await Promise.all([
          fetch(ordersUrl, { headers }),
          fetch(lowStockUrl, { headers }),
        ]);

        let totalOrders = 0;
        let pendingOrders = 0;
        let lowStockItems = 0;

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          const ordersList = Array.isArray(ordersData.data)
            ? ordersData.data
            : Array.isArray(ordersData)
            ? ordersData
            : [];
          totalOrders = ordersList.length;
          pendingOrders = ordersList.filter(
            (order) => order.status === 'DRAFT' || order.status === 'RESERVED'
          ).length;
        }

        if (lowStockRes.ok) {
          const lowStockData = await lowStockRes.json();
          lowStockItems =
            lowStockData?.meta?.total_items_low ??
            (Array.isArray(lowStockData?.data) ? lowStockData.data.length : 0);
        }

        setMetrics({
          totalOrders,
          pendingOrders,
          lowStockItems,
        });
      } catch (err) {
        console.error('Failed to fetch summary metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [activeOrgId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Orders Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Total Orders</span>
          <span className="p-2 bg-blue-50 text-blue-600 rounded-lg text-lg">📦</span>
        </div>
        <div className="text-3xl font-bold text-gray-900">{metrics.totalOrders}</div>
        <p className="text-xs text-gray-400 mt-1">All pipeline orders</p>
      </div>

      {/* Pending Orders Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Pending Orders</span>
          <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-lg">⏳</span>
        </div>
        <div className="text-3xl font-bold text-gray-900">{metrics.pendingOrders}</div>
        <p className="text-xs text-gray-400 mt-1">Draft or Reserved status</p>
      </div>

      {/* Low Stock Items Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Low Stock Items</span>
          <span className="p-2 bg-red-50 text-red-600 rounded-lg text-lg">⚠️</span>
        </div>
        <div className="text-3xl font-bold text-gray-900">{metrics.lowStockItems}</div>
        <p className="text-xs text-gray-400 mt-1">Threshold ≤ 20 units</p>
      </div>
    </div>
  );
}
