import React from 'react';
import { Dot } from 'lucide-react';
import type { LedgerEntry } from '../../constants/developerDashboardData';

const toneClasses: Record<LedgerEntry['typeTone'], string> = {
  success: 'text-[#3a9e55]',
  info: 'text-[#6174d9]',
  danger: 'text-[#cf6a78]',
};

interface DashboardLedgerTableProps {
  items: LedgerEntry[];
}

export default function DashboardLedgerTable({
  items,
}: DashboardLedgerTableProps) {
  return (
    <section className="rounded-[16px] border border-[#e8ecef] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="border-b border-[#edf1f3]">
              {[
                'Transaction Type',
                'Date',
                'Credit Owner',
                'Buyer',
                'Project Name',
                'Vintage',
                'Quantity',
                'Serial Number',
              ].map((label) => (
                <th
                  key={label}
                  className="bg-[#faf8f4] px-4 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f979f]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[#edf1f3] last:border-b-0">
                <td className={`whitespace-nowrap px-4 py-4 text-[12px] font-semibold ${toneClasses[item.typeTone]}`}>
                  <span className="inline-flex items-center gap-1">
                    <Dot size={20} />
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-4 text-[12px] text-[#68727a]">{item.date}</td>
                <td className="px-4 py-4 text-[12px] font-semibold text-[#40484f]">{item.owner}</td>
                <td className="px-4 py-4 text-[12px] font-semibold text-[#40484f]">{item.buyer}</td>
                <td className="px-4 py-4 text-[12px] font-semibold text-[#40484f]">{item.projectName}</td>
                <td className="px-4 py-4 text-[12px] font-semibold text-[#40484f]">{item.vintage}</td>
                <td className="px-4 py-4 text-[12px] font-bold text-[#2c343a]">{item.quantity}</td>
                <td className="px-4 py-4 text-[11px] font-semibold text-[#7d858c]">{item.serialNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
