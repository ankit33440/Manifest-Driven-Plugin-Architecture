import React from 'react';
import { Bell, HelpCircle, Search } from 'lucide-react';
import { useAuth } from '../../../../core/auth/AuthContext';
import { DASHBOARD_SEARCH_PLACEHOLDER } from '../../constants/developerDashboard';

export default function DashboardTopbar() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Developer';
  const initials = (user?.name ?? 'PD')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <header className="rounded-[26px] bg-[#1c2f39] px-4 py-3 text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:px-5 lg:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="hidden rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold tracking-wide text-white/90 sm:block">
            Nature&apos;s Registry
          </div>
          <label className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-700 transition focus-within:ring-2 focus-within:ring-white/40">
            <Search size={18} className="text-slate-400" />
            <input
              type="search"
              placeholder={DASHBOARD_SEARCH_PLACEHOLDER}
              className="w-full min-w-0 border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
              aria-label="Search dashboard content"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Help"
            >
              <HelpCircle size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{user?.name ?? firstName}</p>
              <p className="text-xs text-white/70">Project Developer</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#d9c98d] bg-[#f1e4a6] text-sm font-bold text-[#1c2f39]">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
