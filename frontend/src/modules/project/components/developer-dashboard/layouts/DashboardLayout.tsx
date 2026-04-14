import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import DashboardHeader from '../DashboardHeader';
import DashboardSidebar from '../DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-[#243038]">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close sidebar overlay"
              className="absolute inset-0 bg-[#10212c]/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative h-full w-[270px] max-w-[86vw]">
              <DashboardSidebar
                mobile
                onClose={() => setSidebarOpen(false)}
              />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#23323b] shadow-sm"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            onOpenSidebar={() => setSidebarOpen(true)}
            menuButton={
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>
            }
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
