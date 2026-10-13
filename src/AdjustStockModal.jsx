import { useState, useEffect } from 'react';

export default function AdjustStockModal({ isOpen, onClose, onStockAdjusted }) {
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantityChange, setQuantityChange] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('token');
    const orgId = localStorage.getItem('organization_id');
    if (!token || !orgId) return;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    fetch(`${import.meta.env.VITE_API_URL}/api/v1/products?organization_id=${orgId}`, { headers })
      .then(res => res.json())
      .then(data => { if (data.data) setProducts(data.data); })
      .catch(() => {});

    fetch(`${import.meta.env.VITE_API_URL}/api/v1/warehouses?organization_id=${orgId}`, { headers })
      .then(res => res.json())
      .then(data => { if (data.data) setWarehouses(data.data); })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const orgId = localStorage.getItem('organization_id');
      if (!orgId) {
        throw new Error('No active organization found. Please select or create an organization first.');
      }

      const response = await fetch(import.meta.env.VITE_API_URL + '/api/v1/inventory/adjust', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organization_id: orgId,
          product_id: productId,
          warehouse_id: warehouseId,
          quantity_change: Number(quantityChange)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to adjust stock');
      }

      // Clear form and trigger table refresh
      setProductId('');
      setWarehouseId('');
      setQuantityChange('');
      if (onStockAdjusted) {
        onStockAdjusted();
      }
      if (onClose) {
        onClose();
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center font-['Inter']">
      <div className="bg-white w-[440px] rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Adjust Stock Level</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Product ID</label>
            {products.length > 0 ? (
              <select
                required
                value={productId}
                onChange={e => setProductId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600 bg-white text-gray-900 text-sm"
              >
                <option value="">Select a Product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku || p.id.slice(0, 8)})
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                type="text"
                placeholder="Enter Product UUID"
                value={productId}
                onChange={e => setProductId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600 text-sm"
              />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Warehouse ID</label>
            {warehouses.length > 0 ? (
              <select
                required
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600 bg-white text-gray-900 text-sm"
              >
                <option value="">Select a Warehouse...</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.location || w.id.slice(0, 8)})
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                type="text"
                placeholder="Enter Warehouse UUID"
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600 text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Quantity Change</label>
            <p className="text-xs text-gray-500 mb-1.5">Enter a positive number to add stock, negative to deduct.</p>
            <input
              required
              type="number"
              placeholder="e.g. 50 or -10"
              value={quantityChange}
              onChange={e => setQuantityChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600 text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-md cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md disabled:opacity-50 transition-colors cursor-pointer text-sm"
            >
              {isLoading ? 'Saving...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}