import React from 'react';

export default function DashboardBrand() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 overflow-hidden rounded-sm bg-[#20353e]">
        <div className="absolute left-0 top-0 h-6 w-6 bg-[#d4e33b]" />
        <div className="absolute right-0 top-0 h-6 w-6 bg-[#d4e33b] [clip-path:polygon(0_0,100%_0,100%_100%)]" />
        <div className="absolute bottom-0 left-0 h-6 w-6 bg-[#83d0d8] [clip-path:polygon(0_0,100%_100%,0_100%)]" />
      </div>
      <div className="leading-none text-white">
        <div className="text-[22px] font-extrabold tracking-[-0.03em]">Nature&apos;s</div>
        <div className="text-[22px] font-extrabold tracking-[-0.03em]">Registry</div>
      </div>
    </div>
  );
}
