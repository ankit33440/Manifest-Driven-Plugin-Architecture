import React from 'react';
import { Bell, HelpCircle, Menu, Search } from 'lucide-react';
import { useAuth } from '../core/auth/AuthContext';

interface HeaderProps {
  onOpenSidebar: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Super Admin',
  PROJECT_DEVELOPER: 'Project Developer',
  VERIFIER: 'Verifier',
  CERTIFIER: 'Certifier',
  BUYER: 'Buyer',
};

export default function Header({ onOpenSidebar }: HeaderProps) {
  const { user } = useAuth();

  const initials = (user?.name ?? '')
    .split(' ')
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role.replace(/_/g, ' ')) : '';

  return (
    <header className="flex items-center gap-3 border-b border-sidebar-header-border bg-sidebar-bg px-4 py-[13px] sm:px-6">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={17} />
      </button>

      {/* Search */}
      <label className="hidden max-w-[560px] flex-1 items-center gap-2.5 rounded-lg bg-white px-3.5 py-2 md:flex cursor-text">
        <Search size={14} className="flex-shrink-0 text-ink-faint" />
        <input
          type="search"
          className="w-full border-none bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          placeholder="Search projects, issuers, or serial numbers..."
          aria-label="Search"
        />
      </label>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2 lg:gap-4">
        {/* Notifications */}
        <button
          type="button"
          className="relative inline-flex h-8 w-8 items-center justify-center text-white/75 transition hover:text-white"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute right-[6px] top-[5px] h-1.5 w-1.5 rounded-full bg-alert" />
        </button>

        {/* Help */}
        <button
          type="button"
          className="hidden h-8 w-8 items-center justify-center text-white/60 transition hover:text-white sm:inline-flex"
          aria-label="Help"
        >
          <HelpCircle size={16} />
        </button>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-white/10 lg:block" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-white lg:block">
            <p className="text-[14px] font-semibold leading-tight">{user?.name}</p>
            <p className="mt-0.5 text-[11px] text-white/60">{roleLabel}</p>
          </div>
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-lime/50 bg-[#e7d18e] text-[12px] font-bold text-sidebar-bg">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
