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
    <aside className="flex h-full w-sidebar flex-col bg-sidebar-bg">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-[14px]">
        {/* Logo mark */}
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-sm bg-sidebar-bg-active">
          <div className="absolute left-0 top-0 h-5 w-5 bg-brand-lime" />
          <div className="absolute right-0 top-0 h-5 w-5 bg-brand-lime [clip-path:polygon(0_0,100%_0,100%_100%)]" />
          <div className="absolute bottom-0 left-0 h-5 w-5 bg-brand-teal [clip-path:polygon(0_0,100%_100%,0_100%)]" />
        </div>
        <div className="leading-none text-sidebar-text">
          <div className="text-[18px] font-extrabold tracking-[-0.03em]">Nature's</div>
          <div className="text-[18px] font-extrabold tracking-[-0.03em]">Registry</div>
        </div>
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
      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-lime/60 bg-[#e7d18e] text-[12px] font-bold text-sidebar-bg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-text truncate leading-tight">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-text-muted truncate leading-tight mt-0.5">
              {roleLabel}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-sidebar-text-muted transition-colors hover:bg-sidebar-bg-hover hover:text-sidebar-text"
          >
            <LucideIcons.LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
