
import React, { useState, useRef, useEffect } from 'react';
import { 
  Beaker, 
  Zap, 
  ChevronDown, 
  Check, 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Shield, 
  FileText,
  LayoutGrid,
  Layers
} from 'lucide-react';
import { Environment } from '../types';
import { BulkOperationsView } from './BulkOperationsView';
import { UserDirectoryView } from './UserDirectoryView';

const TENANTS = [
  'Element 5',
  'LHC',
  'Graham',
  'Maze',
  'YV'
];

export const IdentityManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<'overview' | 'bulk-ops' | 'user-directory'>('overview');
  const [environment, setEnvironment] = useState<Environment>('sandbox');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string>('Element 5');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRootUser = selectedTenant === 'Element 5';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (currentView === 'bulk-ops') {
    return <BulkOperationsView onBack={() => setCurrentView('overview')} selectedTenant={selectedTenant} />;
  }

  if (currentView === 'user-directory') {
    return <UserDirectoryView onBack={() => setCurrentView('overview')} selectedTenant={selectedTenant} />;
  }

  return (
    <div className="space-y-12">
      {/* Top Section: Management Controls & Authority Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Management Card */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="space-y-10">
            {/* Service Environment */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase ml-1">
                Service Environment
              </h3>
              <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                <button
                  onClick={() => setEnvironment('sandbox')}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl transition-all duration-200 ${
                    environment === 'sandbox'
                      ? 'bg-white shadow-sm text-[#F97316] font-bold border border-slate-100'
                      : 'text-slate-400 hover:text-slate-600 font-semibold'
                  }`}
                >
                  <Beaker size={18} className={environment === 'sandbox' ? 'text-[#F97316]' : 'text-slate-400'} />
                  <span className="text-[15px]">QA Sandbox</span>
                </button>
                <button
                  onClick={() => setEnvironment('production')}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl transition-all duration-200 ${
                    environment === 'production'
                      ? 'bg-white shadow-sm text-[#4F46E5] font-bold border border-slate-100'
                      : 'text-slate-400 hover:text-slate-600 font-semibold'
                  }`}
                >
                  <Zap size={18} className={environment === 'production' ? 'text-[#4F46E5]' : 'text-slate-400'} />
                  <span className="text-[15px]">Production</span>
                </button>
              </div>
            </div>

            {/* Base Administrative Context */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase ml-1">
                Base Administrative Context
              </h3>
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between px-6 py-5 bg-white border rounded-xl text-left transition-all duration-200 group ${
                    isDropdownOpen || selectedTenant ? 'border-[#4F46E5] ring-1 ring-[#4F46E5]' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[16px] font-bold text-slate-900">
                    {selectedTenant || 'Select Context'}
                  </span>
                  <ChevronDown 
                    size={20} 
                    className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#4F46E5]' : 'text-slate-400 group-hover:text-slate-600'}`} 
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {TENANTS.map((tenant) => (
                      <button
                        key={tenant}
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className={`text-[15px] font-semibold ${selectedTenant === tenant ? 'text-[#4F46E5]' : 'text-slate-700'}`}>
                          {tenant}
                        </span>
                        {selectedTenant === tenant && <Check size={16} className="text-[#4F46E5]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Global Root Authority Card */}
        <div className={`relative overflow-hidden rounded-[2.5rem] p-10 border transition-all duration-300 flex items-center gap-8 ${
          isRootUser 
            ? 'bg-[#FFFAF2] border-[#FDE68A]/50 shadow-sm' 
            : 'bg-slate-50 border-slate-100 opacity-60'
        }`}>
          <div className="shrink-0">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 border border-white">
              <ShieldCheck size={40} className={isRootUser ? 'text-[#F97316]' : 'text-slate-300'} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className={`text-2xl font-bold ${isRootUser ? 'text-[#92400E]' : 'text-slate-500'}`}>
              Global Root Authority
            </h2>
            <p className={`text-[15px] leading-relaxed max-w-sm font-medium ${isRootUser ? 'text-[#B45309]' : 'text-slate-400'}`}>
              {isRootUser 
                ? 'Operating with full organization-wide visibility. Cross-tenant provisioning enabled.'
                : `Restricted context: Access limited to ${selectedTenant} datasets only.`}
            </p>
          </div>
        </div>
      </div>

      {/* Available Operations Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <LayoutGrid size={18} className="text-[#4F46E5]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Available Operations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* User Directory */}
          <button 
            onClick={() => setCurrentView('user-directory')}
            className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-3xl text-left hover:shadow-md transition-shadow group"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <Users size={28} className="text-slate-600 group-hover:text-[#4F46E5]" />
            </div>
            <div>
              <div className="font-bold text-[#0F172A] text-lg">User Directory</div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">Identities</div>
            </div>
          </button>

          {/* Onboard Users */}
          <button className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-3xl text-left hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <UserPlus size={28} className="text-slate-600 group-hover:text-[#4F46E5]" />
            </div>
            <div>
              <div className="font-bold text-[#0F172A] text-lg">Onboard Users</div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">Provisioning</div>
            </div>
          </button>

          {/* Role Engine (Primary) */}
          <button className="flex items-center gap-5 p-6 bg-[#2563EB] rounded-3xl text-left hover:bg-[#1D4ED8] transition-colors shadow-lg shadow-blue-100 group">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Shield size={28} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg">Role Engine</div>
              <div className="text-[10px] font-bold tracking-widest text-blue-100 uppercase mt-0.5">RBAC / NEOS</div>
            </div>
          </button>

          {/* Policy Logic (Secondary) */}
          <button className="flex items-center gap-5 p-6 bg-[#0F172A] rounded-3xl text-left hover:bg-[#1E293B] transition-colors shadow-lg shadow-slate-200 group">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg">Policy Logic</div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">Attribute Access</div>
            </div>
          </button>

          {/* Role Groups and Bulk Operations */}
          <button 
            onClick={() => setCurrentView('bulk-ops')}
            className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-3xl text-left hover:shadow-md transition-shadow group lg:col-span-2 xl:col-span-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <Layers size={28} className="text-slate-600 group-hover:text-[#4F46E5]" />
            </div>
            <div>
              <div className="font-bold text-[#0F172A] text-lg leading-tight">Role Groups & Bulk Ops</div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">Administration</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
