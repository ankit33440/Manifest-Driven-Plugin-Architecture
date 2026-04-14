import React from 'react';
import { ArrowRight } from 'lucide-react';
import {
  developerQuickActions,
  developerSupportLinks,
} from '../../constants/developerDashboard';

interface DeveloperQuickActionsProps {
  onNavigate: (href: string) => void;
}

export default function DeveloperQuickActions({
  onNavigate,
}: DeveloperQuickActionsProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[#eadfd2] bg-[#fffdfa] p-5">
        <h3 className="text-base font-semibold text-slate-900">Submission Readiness</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Keep your documentation complete before sending a project for verification.
        </p>

        <div className="mt-5 space-y-3">
          {[
            'Basic information',
            'Geospatial boundary',
            'Required documents',
          ].map((item, index) => (
            <div key={item} className="flex items-start gap-3">
              <span
                className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  index < 2
                    ? 'bg-[#1c2f39] text-white'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {index < 2 ? '✓' : index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">{item}</p>
                <p className="text-xs text-slate-500">
                  {index < 2 ? 'Ready for submission' : 'Pending upload or review'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/projects/new')}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#1c2f39] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#243845]"
        >
          Submit New Project
        </button>
      </div>

      <div className="rounded-[24px] border border-[#e8ecef] bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
        <div className="mt-4 space-y-3">
          {developerQuickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.href)}
                className="group flex w-full items-start gap-3 rounded-2xl border border-transparent bg-[#f7f9fa] px-4 py-4 text-left transition hover:border-[#d7dee3] hover:bg-white"
              >
                <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-[#1c2f39] shadow-sm">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {action.description}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="mt-1 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700"
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[24px] border border-[#e8ecef] bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">Support</h3>
        <div className="mt-4 space-y-3">
          {developerSupportLinks.map((link) => {
            const Icon = link.icon;
            return (
              <div
                key={link.id}
                className="flex items-start gap-3 rounded-2xl bg-[#f7f9fa] px-4 py-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-[#1c2f39] shadow-sm">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {link.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
