import React from 'react';
import { NavLink } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../core/auth/AuthContext';
import { getNavFor } from '../core/plugin-loader';

function getIcon(name: string): React.ComponentType<any> {
  const icon = (LucideIcons as Record<string, any>)[name];
  return icon ?? LucideIcons.Circle;
}

interface SidebarProps {
  onClose?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Super Admin',
  PROJECT_DEVELOPER: 'Project Developer',
  VERIFIER: 'Verifier',
  CERTIFIER: 'Certifier',
  BUYER: 'Buyer',
};

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const DashboardIcon = getIcon('LayoutDashboard');
  const pluginNav = getNavFor(user.role);
  const roleLabel = ROLE_LABELS[user.role] ?? user.role.replace(/_/g, ' ');
  const initials = user.name
    .split(' ')
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  return (
    <aside className="flex h-full w-sidebar flex-col bg-surface border-r border-line">
      {/* Brand — stays dark for contrast */}
      <div className="flex items-center bg-sidebar-bg px-5 py-[14px]">
        <img src="/logo.png" alt="Nature's Registry" className="h-9 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? 'nav-item-active' : 'nav-item-default'
          }
        >
          <DashboardIcon size={17} strokeWidth={2} />
          <span>Dashboard</span>
        </NavLink>

        {/* Plugin nav items */}
        {pluginNav.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <NavLink
              key={`${item.label}-${item.path}`}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'nav-item-active' : 'nav-item-default'
              }
            >
              <Icon size={17} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Settings always at bottom of nav */}
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? 'nav-item-active' : 'nav-item-default'
          }
        >
          <LucideIcons.Settings size={17} strokeWidth={2} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* User footer */}
      <div className="border-t border-line px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-lime/60 bg-[#e7d18e] text-[12px] font-bold text-sidebar-bg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate leading-tight">
              {user.name}
            </p>
            <p className="text-xs text-ink-muted truncate leading-tight mt-0.5">
              {roleLabel}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <LucideIcons.LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
