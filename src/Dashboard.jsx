export default function Dashboard() {
  return (
    // The main wrapper: Full screen, Flex row to put sidebar next to content
    <div className="flex h-screen w-full bg-gray-50 font-['Inter']">
      
      {/* LEFT SIDEBAR (240px wide, dark theme) */}
      <aside className="w-[240px] bg-gray-900 text-white flex flex-col">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-xl font-bold">StockFlow Lite</span>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button className="text-left px-4 py-2 bg-blue-600 rounded-md font-medium text-white">
            Dashboard
          </button>
          <button className="text-left px-4 py-2 hover:bg-gray-800 rounded-md font-medium text-gray-300 transition-colors">
            Orders
          </button>
          <button className="text-left px-4 py-2 hover:bg-gray-800 rounded-md font-medium text-gray-300 transition-colors">
            Inventory
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA (Takes up remaining space) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER (64px tall, white) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-gray-800">Dashboard Overview</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              A
            </div>
            <span className="text-sm font-bold text-gray-700">Admin User</span>
          </div>
        </header>

        {/* PAGE CONTENT (Where the tables will go) */}
        <main className="flex-1 overflow-auto p-8">
          <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 font-bold">
            Data Tables will go here
          </div>
        </main>
        
      </div>
    </div>
  );
}