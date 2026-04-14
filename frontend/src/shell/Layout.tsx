import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../core/auth/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import AppRouter from './AppRouter';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile sidebar drawer ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-sidebar-bg/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Panel */}
          <div className="relative z-10 flex h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-0 top-3 translate-x-full ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white"
              aria-label="Close navigation"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <AppRouter />
        </main>
      </div>
    </div>
  );
}
