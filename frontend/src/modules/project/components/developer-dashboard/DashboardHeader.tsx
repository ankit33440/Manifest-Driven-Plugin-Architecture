import React from 'react';
import { Bell, HelpCircle, Search } from 'lucide-react';
import { useAuth } from '../../../../core/auth/AuthContext';
import { dashboardSearchPlaceholder } from '../../constants/developerDashboardData';

interface DashboardHeaderProps {
  onOpenSidebar: () => void;
  menuButton?: React.ReactNode;
}

export default function DashboardHeader({
  menuButton,
}: DashboardHeaderProps) {
  const { user } = useAuth();
  const initials = (user?.name ?? 'AS')
    .split(' ')
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  return (
    <header className="border-b border-[#d5dde1] bg-[#1c2f39] px-4 py-[13px] sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        {menuButton}
        <label className="hidden max-w-[640px] flex-1 items-center gap-3 rounded-[10px] bg-white px-4 py-2.5 md:flex">
          <Search size={15} className="text-[#7d8690]" />
          <input
            type="search"
            className="w-full border-none bg-transparent text-[14px] text-[#27323a] outline-none placeholder:text-[#8b939b]"
            placeholder={dashboardSearchPlaceholder}
            aria-label="Search projects"
          />
        </label>
        <div className="ml-auto flex items-center gap-3 lg:gap-5">
          <div className="flex items-center gap-3 text-white">
            <button
              type="button"
              className="relative inline-flex h-8 w-8 items-center justify-center text-white/85 transition hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute right-[7px] top-[5px] h-1.5 w-1.5 rounded-full bg-[#ef6b63]" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center text-white/75 transition hover:text-white"
              aria-label="Help"
            >
              <HelpCircle size={16} />
            </button>
          </div>
          <div className="hidden h-10 w-px bg-white/10 lg:block" />
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-white lg:block">
              <div className="text-[15px] font-semibold leading-tight">
                {user?.name ?? 'Alex Sterling'}
              </div>
              <div className="mt-0.5 text-[12px] text-white/70">
                Project Developer
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#d2c183] bg-[#e7d18e] text-[13px] font-bold text-[#1c2f39]">
              {initials}
            </div>
          </div>
        </div>
      </div>
      <label className="mt-3 flex items-center gap-3 rounded-[10px] bg-white px-4 py-2.5 md:hidden">
        <Search size={15} className="text-[#7d8690]" />
        <input
          type="search"
          className="w-full border-none bg-transparent text-[14px] text-[#27323a] outline-none placeholder:text-[#8b939b]"
          placeholder={dashboardSearchPlaceholder}
          aria-label="Search projects"
        />
      </label>
    </header>
  );
}
