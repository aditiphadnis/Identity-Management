
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  BarChart3, 
  Key, 
  Settings, 
  Building2 
} from 'lucide-react';
import { NavItem } from '../types';

const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tenants', label: 'Tenants', icon: Building2 },
  { id: 'workflows', label: 'Workflows', icon: GitBranch },
  { id: 'users', label: 'Users', icon: Users, isActive: true },
  { id: 'dashboards', label: 'Dashboards', icon: BarChart3 },
  { id: 'credentials', label: 'Credentials', icon: Key },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-100 flex flex-col shrink-0 bg-white">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
          <span className="text-white font-bold text-xl">e</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-[#0F172A]">Enterprise.ai</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              item.isActive 
                ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={20} className={item.isActive ? 'text-[#4F46E5]' : 'text-slate-400'} />
            <span className="text-[15px]">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="relative">
            <img 
              src="https://picsum.photos/id/64/40/40" 
              alt="User" 
              className="w-10 h-10 rounded-full bg-slate-100"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-[#0F172A] truncate">Support User</span>
            <span className="text-xs text-slate-500 truncate">support@enterprise.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
