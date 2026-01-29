
import React from 'react';
import { ArrowLeft, ShieldCheck, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-50">
      <div className="flex items-center gap-2 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors font-semibold text-[15px]">
        <ArrowLeft size={18} />
        <span>Back to Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0FDF4] text-[#166534] rounded-full border border-[#DCFCE7] text-xs font-bold tracking-wider">
          <ShieldCheck size={14} className="text-[#22C55E]" />
          <span>ROOT ACCESS SECURED</span>
        </div>
        
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};
