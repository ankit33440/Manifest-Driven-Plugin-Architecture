import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../core/auth/AuthContext';
import { getNavFor } from '../core/plugin-loader';

const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: 'bg-red-100 text-red-700',
  PROJECT_DEVELOPER: 'bg-blue-100 text-blue-700',
  VERIFIER: 'bg-purple-100 text-purple-700',
  CERTIFIER: 'bg-amber-100 text-amber-700',
  BUYER: 'bg-green-100 text-green-700',
};

function getIcon(name: string): React.ComponentType<{ size?: number; className?: string }> {
  const icon = (LucideIcons as Record<string, any>)[name];
  return icon ?? LucideIcons.Circle;
}

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Dashboard is a core nav item (not from any plugin)
  const DashboardIcon = getIcon('LayoutDashboard');
  const pluginNav = getNavFor(user.role);

  const roleColor = ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700';
  const roleLabel = user.role.replace(/_/g, ' ');

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <span className="text-2xl">🌿</span>
        <div>
          <div className="font-bold text-gray-900 text-sm leading-tight">Nature's Registry</div>
          <div className="text-xs text-gray-500">Carbon Credit Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Dashboard — always visible, from core */}
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <DashboardIcon size={18} />
          Dashboard
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
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
        </div>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${roleColor} mb-3`}>
          {roleLabel}
        </span>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LucideIcons.LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
