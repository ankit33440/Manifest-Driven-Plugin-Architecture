import React from 'react';
import { useLocation } from 'react-router-dom';
import { developerSidebarItems } from '../../constants/developerDashboardData';
import DashboardBrand from './DashboardBrand';
import DashboardNavItem from './DashboardNavItem';

interface DashboardSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({
  mobile = false,
  onClose,
}: DashboardSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`flex h-full w-[226px] flex-col border-r border-[#e3e8eb] bg-white ${
        mobile ? 'shadow-2xl' : ''
      }`}
    >
      <div className="bg-[#1c2f39] px-5 py-[13px]">
        <DashboardBrand />
      </div>
      <nav className="flex-1 px-3 py-5">
        <div className="space-y-2">
          {developerSidebarItems.map((item) => {
            const isActive =
              item.id === 'dashboard'
                ? location.pathname === '/dashboard'
                : item.id === 'projects'
                  ? location.pathname.startsWith('/projects')
                  : false;
            return (
              <DashboardNavItem
                key={item.id}
                item={item}
                active={isActive}
                onClick={onClose}
              />
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
