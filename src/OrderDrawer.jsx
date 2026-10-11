export default function OrderDrawer({ isOpen, onClose, order }) {
  // If the drawer is closed, don't render anything
  if (!isOpen || !order) return null;

  return (
    // The dark transparent overlay background
    <div className="fixed inset-0 bg-black/30 z-40 flex justify-end">
      
      {/* The actual white drawer sliding in from the right */}
      <div className="w-[480px] h-full bg-white shadow-2xl flex flex-col animate-slide-in-right font-['Inter']">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{order.id}</h2>
            <p className="text-sm text-gray-500 mt-1">Customer: {order.customer}</p>
          </div>
          {/* Close Button */}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold text-xl">
            ✕
          </button>
        </div>

        {/* Order Details Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            Order Details
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-bold">{order.items}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold">{order.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Status:</span>
              <span className="font-bold text-blue-600">{order.status}</span>
            </div>
          </div>
        </div>

        {/* The State Machine Actions (Footer) */}
     {/* The State Machine Actions (Footer) */}
        <div className="p-6 border-t border-gray-200 bg-white gap-3 flex flex-col">
          
          {order.status === 'DRAFT' && (
            <button 
              onClick={() => onUpdateStatus(order.id, 'RESERVED')}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Reserve Stock
            </button>
          )}
          
          {order.status === 'RESERVED' && (
            <>
              <button 
                onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Confirm Order
              </button>
              <button 
                onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                className="w-full bg-red-100 text-red-600 font-bold py-3 rounded-md hover:bg-red-200 transition-colors"
              >
                Cancel Order
              </button>
            </>
          )}

          {order.status === 'CONFIRMED' && (
            <button 
              onClick={() => onUpdateStatus(order.id, 'FULFILLED')}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-md hover:bg-black transition-colors"
            >
              Mark as Fulfilled
            </button>
          )}
        </div>

      </div>
    </div>
  );
}