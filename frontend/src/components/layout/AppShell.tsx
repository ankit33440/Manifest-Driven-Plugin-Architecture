import React from 'react';
import { Bell, HelpCircle, Search } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Projects', to: '/projects' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Roles', to: '/admin/roles' },
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#eef2f3]">
      <header className="sticky top-0 z-20 flex h-28 items-center justify-between gap-6 bg-[#20323d] px-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-[22px] bg-[linear-gradient(135deg,#c8ef2d_0%,#d5f76e_28%,#9fd9da_29%,#8acbd0_50%,#0f2230_51%,#254152_100%)]" />
          <div>
            <p className="text-4xl font-bold leading-none tracking-[-0.05em]">Nature&apos;s</p>
            <p className="text-4xl font-bold leading-none tracking-[-0.05em]">Registry</p>
          </div>
        </div>

        <div className="hidden max-w-3xl flex-1 items-center lg:flex">
          <div className="flex h-16 w-full items-center gap-4 rounded-2xl bg-white px-5 text-stone-500">
            <Search className="h-6 w-6" />
            <span className="text-2xl">Search projects, issuers, or serial numbers...</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Bell className="h-6 w-6" />
          <HelpCircle className="h-6 w-6" />
          <div className="h-10 w-px bg-white/20" />
          <div className="text-right">
            <p className="text-2xl font-semibold">{user?.fullName}</p>
            <p className="text-sm text-white/70">{user?.roles.join(', ')}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d8efc6] text-slate-900">
            <span className="text-xl font-bold">{user?.firstName?.[0]}</span>
          </div>
          <button onClick={() => void logout()} className="secondary-button !border-white/10 !bg-white/10 !text-white">
            Sign out
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-7rem)] grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-white/60 bg-white/85 px-8 py-10">
          <nav className="space-y-4">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-2xl px-5 py-4 text-xl font-medium transition ${
                    isActive
                      ? 'bg-stone-100 text-slate-900'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="px-10 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
