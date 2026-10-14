import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function CreateOrderModal({ isOpen, onClose, onOrderCreated }) {
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [customers, setCustomers] = useState([]);
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

    fetch(`${import.meta.env.VITE_API_URL}/api/v1/customers?organization_id=${orgId}`, { headers })
      .then(res => res.json())
      .then(data => { if (data.data) setCustomers(data.data); })
      .catch(() => {});

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

      const response = await fetch(import.meta.env.VITE_API_URL + '/api/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID()
        },
        body: JSON.stringify({
          organization_id: orgId,
          customer_id: customerId,
          items: [
            {
              product_id: productId,
              warehouse_id: warehouseId,
              quantity: Number(quantity),
              unit_price: Number(unitPrice)
            }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create order');
      }

      // Clear form, notify listener, and close modal
      setCustomerId('');
      setProductId('');
      setWarehouseId('');
      setQuantity('');
      setUnitPrice('');
      if (onOrderCreated) {
        onOrderCreated(data.data);
      }
      toast.success('Order created successfully!');
      if (onClose) {
        onClose();
      }

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center font-['Inter']">
      <div className="bg-white w-[500px] rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Create New Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Customer</label>
            {customers.length > 0 ? (
              <select
                required
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600 bg-white text-gray-900"
              >
                <option value="">Select Customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                type="text"
                placeholder="Customer UUID"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600"
              />
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Product</label>
              {products.length > 0 ? (
                <select
                  required
                  value={productId}
                  onChange={e => {
                    const pid = e.target.value;
                    setProductId(pid);
                    const chosen = products.find(p => p.id === pid);
                    if (chosen && chosen.price && !unitPrice) {
                      setUnitPrice(chosen.price);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600 bg-white text-gray-900"
                >
                  <option value="">Select Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${Number(p.price).toFixed(2)})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  type="text"
                  placeholder="Product UUID"
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Warehouse</label>
              {warehouses.length > 0 ? (
                <select
                  required
                  value={warehouseId}
                  onChange={e => setWarehouseId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600 bg-white text-gray-900"
                >
                  <option value="">Select Warehouse...</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  type="text"
                  placeholder="Warehouse UUID"
                  value={warehouseId}
                  onChange={e => setWarehouseId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
              <input required type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Unit Price ($)</label>
              <input required type="number" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-md">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}