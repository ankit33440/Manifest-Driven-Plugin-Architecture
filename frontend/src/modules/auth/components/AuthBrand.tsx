import React from 'react';
import { ShieldCheck, Leaf, BarChart3, Globe2 } from 'lucide-react';

const FEATURES = [
  {
    icon: Leaf,
    title: 'Carbon Project Registry',
    desc: 'Register and manage carbon offset projects across forestry, agriculture, and clean energy sectors.',
  },
  {
    icon: ShieldCheck,
    title: 'End-to-End Verification',
    desc: 'Independent verifiers and certifiers validate every credit for rigorous compliance and transparency.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Tracking',
    desc: 'Monitor project status, credit issuance, and portfolio performance through a unified dashboard.',
  },
  {
    icon: Globe2,
    title: 'Trusted Marketplace',
    desc: 'Buy and retire verified carbon credits with full audit trails and regulatory-grade reporting.',
  },
];

export default function AuthBrand() {
  return (
    <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-accent px-14 py-14">
      {/* Logo */}
      <div>
        <img src="/logo.png" alt="Nature's Registry" className="h-12 w-auto object-contain" />
      </div>

      {/* Main copy + feature list */}
      <div className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-[2rem] font-bold leading-tight text-white">
            The trusted platform for<br />carbon credit lifecycle<br />management
          </h2>
          <p className="text-sm text-white/55 leading-relaxed max-w-sm">
            From project registration to credit retirement — Nature's Registry brings
            developers, verifiers, certifiers, and buyers onto one transparent platform.
          </p>
        </div>

        <div className="space-y-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/8 border border-white/10">
                <Icon size={16} className="text-[#d4e33b]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="flex items-center gap-8 border-t border-white/10 pt-6">
        <div>
          <p className="text-lg font-bold text-white">500+</p>
          <p className="text-xs text-white/45">Projects Registered</p>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div>
          <p className="text-lg font-bold text-white">2M+</p>
          <p className="text-xs text-white/45">Credits Issued</p>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div>
          <p className="text-lg font-bold text-white">40+</p>
          <p className="text-xs text-white/45">Countries</p>
        </div>
      </div>
    </div>
  );
}
