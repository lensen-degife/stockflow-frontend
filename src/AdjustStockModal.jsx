import { useState } from 'react';

export default function AdjustStockModal({ isOpen, onClose, onStockAdjusted }) {
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantityChange, setQuantityChange] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const orgId = localStorage.getItem('organization_id') || '00000000-0000-0000-0000-000000000000';

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inventory/adjust`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organization_id: orgId,
          product_id: productId,
          warehouse_id: warehouseId,
          quantity_change: Number(quantityChange) // Positive adds stock, negative deducts
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to adjust stock');
      }

      // Clear form and trigger table refresh
      setProductId('');
      setWarehouseId('');
      setQuantityChange(0);
      onStockAdjusted();
      onClose();

    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center font-['Inter']">
      <div className="bg-white w-[400px] rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Adjust Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Product ID</label>
            <input required type="text" value={productId} onChange={e => setProductId(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Warehouse ID</label>
            <input required type="text" value={warehouseId} onChange={e => setWarehouseId(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Quantity Change</label>
            <p className="text-xs text-gray-500 mb-2">Use positive numbers to add stock, negative to deduct.</p>
            <input required type="number" value={quantityChange} onChange={e => setQuantityChange(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-600" />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-md">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-900 text-white font-bold rounded-md hover:bg-black disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}