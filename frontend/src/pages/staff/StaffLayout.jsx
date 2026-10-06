import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Menu, X } from 'lucide-react';

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 ambient-bg">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex-shrink-0 animate-in">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center h-14 px-4 border-b border-slate-800 bg-slate-950 gap-3">
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-base font-bold text-white">MotorGuard</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
