import React from 'react';
import { NavLink } from 'react-router-dom';
import type { DeveloperSidebarItem } from '../../constants/developerDashboardData';

interface DashboardNavItemProps {
  item: DeveloperSidebarItem;
  active?: boolean;
  onClick?: () => void;
}

export default function DashboardNavItem({
  item,
  active = false,
  onClick,
}: DashboardNavItemProps) {
  const Icon = item.icon;
  const classes = `flex w-full items-center gap-3 rounded-[11px] px-4 py-3 text-left text-[15px] font-semibold transition ${
    active
      ? 'bg-[#1f343f] text-white shadow-[0_8px_18px_rgba(31,52,63,0.16)]'
      : 'text-[#6f7376] hover:bg-[#f3f6f8] hover:text-[#22313a]'
  }`;

  if (item.href) {
    return (
      <NavLink to={item.href} onClick={onClick} className={classes}>
        <Icon size={18} strokeWidth={2} />
        <span>{item.label}</span>
      </NavLink>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      <Icon size={18} strokeWidth={2} />
      <span>{item.label}</span>
    </button>
  );
}
