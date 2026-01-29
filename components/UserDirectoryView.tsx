
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  MoreVertical, 
  Shield, 
  UserCircle, 
  CheckCircle2, 
  Filter,
  Users,
  Building2,
  ChevronDown,
  X,
  Lock,
  Cpu,
  LayoutDashboard,
  FileText,
  GitBranch,
  ChevronUp,
  AlertTriangle,
  Plus,
  RotateCcw,
  Globe,
  Eye,
  Check,
  PlusCircle,
  Trash2,
  UserMinus
} from 'lucide-react';

interface RoleGroup {
  id: string;
  name: string;
  roles: string[];
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  tenants: string[];
  assignedRoles: string[]; 
  roleGroups: RoleGroup[]; 
  status: 'active' | 'pending' | 'suspended';
  hasGlobalVisibility?: boolean; 
}

const ROLE_PERMISSIONS: Record<string, any> = {
  'User Authority': {
    workflows: [{ name: 'Claims processing', providedBy: 'User Authority' }],
    neos: { status: 'App', providedBy: 'User Authority' },
    vault: { enabled: false, providedBy: null },
    dashboards: { items: ['Individual Stats'], providedBy: 'User Authority' }
  },
  'Support Tier 1': {
    workflows: [{ name: 'Denials management', providedBy: 'Support Tier 1' }],
    dashboards: { items: ['Customer Success KPI', 'Support Queue'], providedBy: 'Support Tier 1' },
    neos: { status: 'None', providedBy: null },
    vault: { enabled: false, providedBy: null }
  },
  'Admin Authority': {
    workflows: [{ name: 'Eligibility authorization', providedBy: 'Admin Authority' }],
    vault: { enabled: true, providedBy: 'Admin Authority' },
    neos: { status: 'User', providedBy: 'Admin Authority' },
    dashboards: { items: ['Admin Overview'], providedBy: 'Admin Authority' }
  },
  'Regional Compliance': {
    workflows: [{ name: 'Audit Workflow', providedBy: 'Regional Compliance' }],
    dashboards: { items: ['Regional Revenue', 'Staff Productivity'], providedBy: 'Regional Compliance' },
    neos: { status: 'None', providedBy: null },
    vault: { enabled: false, providedBy: null }
  }
};

const AVAILABLE_ROLE_GROUPS = [
  { id: 'rg-global', name: 'Global Compliance', roles: ['Regional Compliance'] },
  { id: 'rg-support', name: 'Standard Support Pack', roles: ['Support Tier 1'] },
  { id: 'rg-exec', name: 'Executive Audit', roles: ['Regional Compliance', 'Support Tier 1'] }
];

const INITIAL_MOCK_DIRECTORY: UserRecord[] = [
  {
    id: '1',
    name: 'Jane Cooper',
    email: 'jane.cooper@element5.ai',
    tenants: ['Element 5', 'LHC', 'Graham', 'Maze', 'YV'],
    assignedRoles: ['Admin Authority'],
    roleGroups: [{ id: 'rg-global', name: 'Global Compliance', roles: ['Regional Compliance'] }],
    status: 'active',
    hasGlobalVisibility: true 
  },
  {
    id: '2',
    name: 'Cody Fisher',
    email: 'cody.fisher@element5.ai',
    tenants: ['Element 5', 'Maze'],
    assignedRoles: ['User Authority'],
    roleGroups: [{ id: 'rg-support', name: 'Standard Support Pack', roles: ['Support Tier 1'] }],
    status: 'active',
    hasGlobalVisibility: false
  },
  {
    id: '3',
    name: 'Jenny Wilson',
    email: 'j.wilson@element5.ai',
    tenants: ['LHC'],
    assignedRoles: ['Support Tier 1'],
    roleGroups: [],
    status: 'active',
    hasGlobalVisibility: false
  },
  {
    id: '4',
    name: 'Robert Fox',
    email: 'r.fox@graham.com',
    tenants: ['Graham', 'Element 5'],
    assignedRoles: ['User Authority'],
    roleGroups: [],
    status: 'active',
    hasGlobalVisibility: false
  }
];

interface MultiSelectProps {
  label: string;
  icon: React.ElementType;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, icon: Icon, options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const isAllSelected = filteredOptions.length > 0 && filteredOptions.every(opt => selected.includes(opt));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onChange(selected.filter(item => !filteredOptions.includes(item)));
    } else {
      onChange(Array.from(new Set([...selected, ...filteredOptions])));
    }
  };

  return (
    <div className="relative flex-1 min-w-[200px]" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-white rounded-2xl border transition-all text-[14px] font-bold shadow-sm ${isOpen ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-indigo-200'} text-slate-700`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon size={16} className={`${selected.length > 0 ? 'text-indigo-500' : 'text-slate-400'} shrink-0`} />
          <span className="truncate">
            {selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} Selected`}
          </span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-3 border-b border-slate-50 bg-slate-50/30">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${label}...`}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-[13px] font-semibold focus:ring-2 focus:ring-indigo-100 transition-all"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50"
              >
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isAllSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                  {isAllSelected && <Check size={10} className="text-white" />}
                </div>
                <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">Select All</span>
              </button>
            )}

            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleOption(option)}
                    className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-indigo-50/50 transition-colors text-left group"
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${selected.includes(option) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-300'}`}>
                      {selected.includes(option) && <Check size={10} className="text-white" />}
                    </div>
                    <span className={`text-[14px] ${selected.includes(option) ? 'text-indigo-600 font-bold' : 'text-slate-700 font-medium'}`}>{option}</span>
                  </button>
                ))
              ) : (
                <div className="px-5 py-6 text-center text-xs text-slate-400 font-medium">
                  No {label.toLowerCase()} match
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface Props {
  onBack: () => void;
  selectedTenant: string;
}

export const UserDirectoryView: React.FC<Props> = ({ onBack, selectedTenant }) => {
  const [directory, setDirectory] = useState<UserRecord[]>(INITIAL_MOCK_DIRECTORY);
  const [searchQuery, setSearchQuery] = useState('');
  
  const allAvailableTenants = useMemo(() => Array.from(new Set(directory.flatMap(u => u.tenants))), [directory]);
  const allAvailableGroups = useMemo(() => AVAILABLE_ROLE_GROUPS.map(g => g.name), []);
  const allAvailableRoles = useMemo(() => Object.keys(ROLE_PERMISSIONS), []);

  const [filterTenants, setFilterTenants] = useState<string[]>(allAvailableTenants);
  const [filterRoleGroups, setFilterRoleGroups] = useState<string[]>(allAvailableGroups);
  const [filterDirectRoles, setFilterDirectRoles] = useState<string[]>([]);

  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [activeAssignMenu, setActiveAssignMenu] = useState<{ userId: string, type: 'role' | 'group' } | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    mode: 'assign' | 'revoke' | 'delete';
    type?: 'role' | 'group' | 'user';
    userId: string;
    targetId?: string;
    label: string;
  } | null>(null);

  const assignMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (assignMenuRef.current && !assignMenuRef.current.contains(e.target as Node)) {
        setActiveAssignMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedUsers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedUsers(next);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterTenants([]);
    setFilterRoleGroups([]);
    setFilterDirectRoles([]);
  };

  const isFiltered = searchQuery !== '' || 
                     filterTenants.length < allAvailableTenants.length || 
                     filterRoleGroups.length < allAvailableGroups.length || 
                     filterDirectRoles.length > 0;

  const filteredUsers = useMemo(() => {
    return directory.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTenant = filterTenants.length === 0 || user.tenants.some(t => filterTenants.includes(t));
      const matchesRoleGroup = filterRoleGroups.length === 0 || user.roleGroups.some(g => filterRoleGroups.includes(g.name));
      const matchesDirectRole = filterDirectRoles.length === 0 || user.assignedRoles.some(r => filterDirectRoles.includes(r));
      return matchesSearch && matchesTenant && matchesRoleGroup && matchesDirectRole;
    });
  }, [directory, searchQuery, filterTenants, filterRoleGroups, filterDirectRoles, allAvailableTenants.length, allAvailableGroups.length]);

  const handleExecuteAction = () => {
    if (!pendingAction) return;

    if (pendingAction.mode === 'delete') {
      setDirectory(prev => prev.filter(user => user.id !== pendingAction.userId));
      setPendingAction(null);
      return;
    }

    setDirectory(prev => prev.map(user => {
      if (user.id === pendingAction.userId) {
        if (pendingAction.mode === 'revoke' && pendingAction.targetId) {
          if (pendingAction.type === 'role') return { ...user, assignedRoles: user.assignedRoles.filter(r => r !== pendingAction.targetId) };
          return { ...user, roleGroups: user.roleGroups.filter(g => g.id !== pendingAction.targetId) };
        } else if (pendingAction.mode === 'assign' && pendingAction.targetId) {
          if (pendingAction.type === 'role') return { ...user, assignedRoles: [...new Set([...user.assignedRoles, pendingAction.targetId])] };
          const group = AVAILABLE_ROLE_GROUPS.find(g => g.id === pendingAction.targetId);
          if (group && !user.roleGroups.some(g => g.id === group.id)) return { ...user, roleGroups: [...user.roleGroups, group] };
        }
      }
      return user;
    }));
    setPendingAction(null);
    setActiveAssignMenu(null);
  };

  const renderAssignMenu = (userId: string, type: 'role' | 'group') => {
    const user = directory.find(u => u.id === userId);
    if (!user) return null;

    let items: { id: string, label: string }[] = [];
    if (type === 'role') {
      items = allAvailableRoles
        .filter(r => !user.assignedRoles.includes(r))
        .map(r => ({ id: r, label: r }));
    } else {
      items = AVAILABLE_ROLE_GROUPS
        .filter(g => !user.roleGroups.some(ug => ug.id === g.id))
        .map(g => ({ id: g.id, label: g.name }));
    }

    return (
      <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-1">
        <div className="px-4 py-2 border-b border-slate-50 mb-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign {type === 'role' ? 'Individual Role' : 'Role Group'}</span>
        </div>
        {items.length > 0 ? (
          items.map(item => (
            <button
              key={item.id}
              onClick={() => setPendingAction({
                mode: 'assign',
                type: type,
                userId: userId,
                targetId: item.id,
                label: item.label
              })}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50/50 flex items-center justify-center text-indigo-500">
                {type === 'role' ? <Shield size={16} /> : <Users size={16} />}
              </div>
              <span className="text-sm font-bold text-slate-700">{item.label}</span>
            </button>
          ))
        ) : (
          <div className="px-4 py-4 text-center text-xs text-slate-400 font-medium italic">All available {type}s assigned</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-400 relative">
      {pendingAction && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${pendingAction.mode === 'assign' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-500'}`}>
                {pendingAction.mode === 'assign' ? <PlusCircle size={40} /> : pendingAction.mode === 'delete' ? <UserMinus size={40} /> : <AlertTriangle size={40} />}
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-extrabold text-[#0F172A]">
                  {pendingAction.mode === 'delete' ? 'Confirm Identity Deletion' : 'Confirm Governance Action'}
                </h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  {pendingAction.mode === 'delete' ? (
                    <>Are you sure you want to permanently delete <span className="text-slate-900 font-bold">"{pendingAction.label}"</span> from the directory? This action cannot be undone.</>
                  ) : (
                    <>
                      Are you sure you want to <span className={`font-bold uppercase ${pendingAction.mode === 'revoke' ? 'text-red-600' : 'text-indigo-600'}`}>{pendingAction.mode}</span> the 
                      <span className="text-slate-900 font-bold"> "{pendingAction.label}" </span> 
                      {pendingAction.type === 'role' ? 'role' : 'group'}?
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4 w-full">
                <button onClick={() => setPendingAction(null)} className="flex-1 py-5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button 
                  onClick={handleExecuteAction} 
                  className={`flex-1 py-5 text-white font-bold rounded-2xl transition-all shadow-xl ${pendingAction.mode === 'assign' ? 'bg-[#4F46E5] hover:bg-[#4338CA] shadow-indigo-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
                >
                  {pendingAction.mode === 'delete' ? 'Delete Identity' : 'Confirm & Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 shadow-sm transition-all group">
            <ArrowLeft size={24} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
          </button>
          <div className="space-y-1">
            <h2 className="text-[42px] font-bold text-[#0F172A] tracking-tight leading-none">Identity Directory</h2>
            <p className="text-[18px] text-slate-400 font-medium">Audit organization-wide access and RBAC assignments.</p>
          </div>
        </div>
        <div className="relative w-full md:w-[480px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
          <input 
            type="text"
            placeholder="Search identities or emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-white border border-slate-200 rounded-3xl focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-medium text-lg shadow-sm placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="bg-white/40 p-8 rounded-[3rem] border border-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-5">
          <MultiSelect 
            label="Tenants" 
            icon={Building2} 
            options={allAvailableTenants} 
            selected={filterTenants} 
            onChange={setFilterTenants} 
            placeholder="All Tenants" 
          />
          <MultiSelect 
            label="Groups" 
            icon={Users} 
            options={allAvailableGroups} 
            selected={filterRoleGroups} 
            onChange={setFilterRoleGroups} 
            placeholder="All Groups" 
          />
          <MultiSelect 
            label="Roles" 
            icon={Shield} 
            options={allAvailableRoles} 
            selected={filterDirectRoles} 
            onChange={setFilterDirectRoles} 
            placeholder="All Roles" 
          />
          
          <div className="flex-1 flex justify-end">
            <button 
              onClick={clearAllFilters} 
              disabled={!isFiltered}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-sm shrink-0 ${isFiltered ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-50'}`}
            >
              <RotateCcw size={16} /> CLEAR ALL FILTERS
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50/20">
              <th className="w-20 px-6 py-10 text-center text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">View</th>
              <th className="px-6 py-10 text-[12px] font-black uppercase tracking-[0.25em] text-slate-400">Identity Context</th>
              <th className="px-6 py-10 text-[12px] font-black uppercase tracking-[0.25em] text-slate-400">Base Tenant</th>
              <th className="px-6 py-10 text-[12px] font-black uppercase tracking-[0.25em] text-slate-400">Assigned Role Groups</th>
              <th className="px-6 py-10 text-[12px] font-black uppercase tracking-[0.25em] text-slate-400">Individual Roles</th>
              <th className="px-8 py-10 text-right text-[12px] font-black uppercase tracking-[0.25em] text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => {
              const isExpanded = expandedUsers.has(user.id);
              const baseTenant = user.tenants[0] || 'Unassigned';
              const isElement5 = baseTenant === 'Element 5';
              const moreTenants = isElement5 ? user.tenants.length - 1 : 0;

              return (
                <React.Fragment key={user.id}>
                  <tr className={`group transition-all ${isExpanded ? 'bg-[#EEF2FF]/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-9 text-center">
                      <button onClick={() => toggleExpand(user.id)} className={`p-3.5 rounded-2xl border transition-all ${isExpanded ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-300'}`}>
                        {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                      </button>
                    </td>
                    <td className="px-6 py-9">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-50 group-hover:bg-white transition-colors text-2xl">
                            {user.name.charAt(0)}
                          </div>
                          {user.hasGlobalVisibility && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm" title="Global Visibility Tier">
                              <Globe size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-0">
                          <span className="font-extrabold text-[#0F172A] text-[19px] tracking-tight">{user.name}</span>
                          <span className="text-[15px] text-slate-400 font-semibold">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-9">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold text-slate-700 shadow-sm">
                          <Building2 size={16} className="text-slate-400" /> {baseTenant}
                        </div>
                        {moreTenants > 0 && (
                          <span className="text-[11px] font-black text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase tracking-wider">+{moreTenants} More</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-9">
                      <div className="flex flex-wrap items-center gap-2 relative">
                        {user.roleGroups.map(group => (
                          <div key={group.id} className="inline-flex items-center group/tag px-4 py-2.5 bg-[#EEF2FF] border border-indigo-100 rounded-2xl transition-all">
                            <span className="text-[13px] font-bold text-[#312E81] flex items-center gap-2"><Users size={16} className="opacity-70" /> {group.name}</span>
                            <button onClick={() => setPendingAction({ mode: 'revoke', type: 'group', userId: user.id, targetId: group.id, label: group.name })} className="ml-3 text-indigo-300 hover:text-red-500 transition-colors"><X size={18} /></button>
                          </div>
                        ))}
                        <div className="relative" ref={activeAssignMenu?.userId === user.id && activeAssignMenu?.type === 'group' ? assignMenuRef : null}>
                          <button 
                            onClick={() => setActiveAssignMenu({ userId: user.id, type: 'group' })} 
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${activeAssignMenu?.userId === user.id && activeAssignMenu?.type === 'group' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50'}`}
                          >
                            <Plus size={22} />
                          </button>
                          {activeAssignMenu?.userId === user.id && activeAssignMenu?.type === 'group' && renderAssignMenu(user.id, 'group')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-9">
                      <div className="flex flex-wrap items-center gap-2 relative">
                        {user.assignedRoles.map(role => (
                          <div key={role} className="inline-flex items-center group/tag px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-200 transition-all">
                            <span className="text-[13px] font-bold text-slate-700 flex items-center gap-2"><Shield size={16} className="text-indigo-400" /> {role}</span>
                            <button onClick={() => setPendingAction({ mode: 'revoke', type: 'role', userId: user.id, targetId: role, label: role })} className="ml-2 text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                          </div>
                        ))}
                        <div className="relative" ref={activeAssignMenu?.userId === user.id && activeAssignMenu?.type === 'role' ? assignMenuRef : null}>
                          <button 
                            onClick={() => setActiveAssignMenu({ userId: user.id, type: 'role' })} 
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${activeAssignMenu?.userId === user.id && activeAssignMenu?.type === 'role' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50'}`}
                          >
                            <Plus size={22} />
                          </button>
                          {activeAssignMenu?.userId === user.id && activeAssignMenu?.type === 'role' && renderAssignMenu(user.id, 'role')}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-9 text-right flex items-center justify-end">
                      <button 
                        onClick={() => setPendingAction({ mode: 'delete', userId: user.id, label: user.name })}
                        className="p-3.5 text-slate-300 hover:text-red-500 transition-all active:scale-95"
                        title="Delete User"
                      >
                        <Trash2 size={24} />
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="px-14 py-16 bg-slate-50/50 border-b border-slate-100 animate-in slide-in-from-top-3">
                        <div className="space-y-12">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-[0.3em] text-slate-400">
                              <GitBranch size={18} className="opacity-60" /> 
                              {isElement5 && user.hasGlobalVisibility ? 'FULL MULTI-TENANT ACCESS MAP' : `AUTHORIZED CONTEXT: ${baseTenant.toUpperCase()}`}
                            </div>
                            <div className={`flex items-center gap-3 text-xs font-bold px-6 py-2.5 rounded-full border ${isElement5 ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                               <Eye size={16} /> Visibility Tier: {isElement5 ? (user.hasGlobalVisibility ? 'Global Vision' : 'Standard Element 5') : 'Restricted Context'}
                            </div>
                          </div>

                          <div className="bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                  <th className="px-12 py-10 text-[11px] font-black uppercase text-slate-400 w-1/4">Environment</th>
                                  <th className="px-10 py-10 text-[11px] font-black uppercase text-slate-400 w-1/4">Workflows</th>
                                  <th className="px-8 py-10 text-[11px] font-black uppercase text-slate-400 text-center">Vault</th>
                                  <th className="px-8 py-10 text-[11px] font-black uppercase text-slate-400 text-center">NIOS</th>
                                  <th className="px-12 py-10 text-[11px] font-black uppercase text-slate-400 w-1/4">Dashboards</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {user.tenants.filter((t, idx) => {
                                  if (!isElement5) return idx === 0; 
                                  if (!user.hasGlobalVisibility) return idx === 0 || t === 'Element 5'; 
                                  return true; 
                                }).map((tenant, tIdx) => {
                                  const permsList = Array.from(new Set([...user.assignedRoles, ...user.roleGroups.flatMap(g => g.roles)])).map(r => ({ role: r, def: ROLE_PERMISSIONS[r] }));
                                  return (
                                    <tr key={tIdx} className="hover:bg-indigo-50/5 transition-colors">
                                      <td className="px-12 py-12 align-top">
                                        <div className="flex items-center gap-5">
                                          <div className="w-16 h-16 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50"><Building2 size={32} /></div>
                                          <span className="font-extrabold text-[#0F172A] text-2xl tracking-tight">{tenant}</span>
                                        </div>
                                      </td>
                                      <td className="px-10 py-12 align-top">
                                        <div className="space-y-8">
                                          {permsList.map((p, pi) => p.def.workflows?.map((wf: any, wi: number) => (
                                            <div key={`${pi}-${wi}`} className="space-y-2">
                                              <div className="text-[17px] font-bold text-slate-700 flex items-center gap-3"><FileText size={20} className="text-slate-300" /> {wf.name}</div>
                                              <div className="text-[11px] font-black text-indigo-400 uppercase tracking-widest pl-8 flex items-center gap-2"><div className="w-6 h-[1px] bg-indigo-100" /> VIA {p.role}</div>
                                            </div>
                                          )))}
                                        </div>
                                      </td>
                                      <td className="px-8 py-12 align-top text-center">
                                        {permsList.some(p => p.def.vault?.enabled) ? (
                                          <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-[2rem] flex items-center justify-center border border-orange-100/50"><Lock size={30} /></div>
                                            <div className="text-[11px] font-black text-orange-600 uppercase tracking-widest px-4 py-1.5 bg-white border border-orange-50 rounded-xl">VIA {permsList.find(p => p.def.vault?.enabled)?.role}</div>
                                          </div>
                                        ) : <span className="text-slate-200 font-extrabold text-2xl">—</span>}
                                      </td>
                                      <td className="px-8 py-12 align-top text-center">
                                        {permsList.some(p => p.def.neos?.status && p.def.neos.status !== 'None') ? (
                                          <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-[2rem] flex items-center justify-center border border-blue-100/50"><Cpu size={30} /></div>
                                            <div className="text-[16px] font-extrabold text-[#0F172A]">Neos access</div>
                                            <div className="text-[11px] font-black text-blue-600 uppercase tracking-widest px-4 py-1.5 bg-white border border-blue-50 rounded-xl">VIA {permsList.find(p => p.def.neos?.status && p.def.neos.status !== 'None')?.role}</div>
                                          </div>
                                        ) : <span className="text-slate-200 font-extrabold text-2xl">—</span>}
                                      </td>
                                      <td className="px-12 py-12 align-top">
                                        <div className="space-y-8">
                                          {permsList.map((p, pi) => p.def.dashboards?.items?.map((item: string, ii: number) => (
                                            <div key={`${pi}-${ii}`} className="space-y-2">
                                              <div className="text-[17px] font-bold text-slate-700 flex items-center gap-3"><LayoutDashboard size={20} className="text-slate-300" /> {item}</div>
                                              <div className="text-[11px] font-black text-purple-400 uppercase tracking-widest pl-8 flex items-center gap-2"><div className="w-6 h-[1px] bg-purple-100" /> VIA {p.role}</div>
                                            </div>
                                          )))}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
