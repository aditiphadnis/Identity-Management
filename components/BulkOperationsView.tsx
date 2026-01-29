
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Mail, 
  Shield, 
  Building2, 
  GitBranch, 
  Lock, 
  Cpu, 
  LayoutDashboard, 
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  X,
  RotateCcw,
  Users,
  PlusCircle,
  ChevronDown,
  UserX,
  Tag,
  Trash2,
  ExternalLink,
  ChevronRight,
  Fingerprint,
  Check,
  Layers,
  UserPlus,
  UserMinus,
  Plus,
  Filter,
  CheckCircle
} from 'lucide-react';

interface Workflow {
  name: string;
  policies: string[];
  providedBy: string;
}

interface RoleGroup {
  id: string;
  name: string;
  roles: string[];
}

interface UserDetail {
  email: string;
  found: boolean;
  assignedRoles: string[]; 
  roleGroups: RoleGroup[]; 
  tenants: string[];
  workflows?: Workflow[];
  vaultAccess?: { enabled: boolean; providedBy: string | null };
  neosEcosystem?: { status: 'User' | 'App' | 'None'; providedBy: string | null };
  dashboards?: { count: number; items: string[]; providedBy: string | null };
}

const ROLE_DEFINITION_LOOKUP: Record<string, any> = {
  'User Authority': {
    workflows: [{ name: 'Claims processing', policies: ['Standard Workflow Only'], providedBy: 'User Authority' }],
    neosEcosystem: { status: 'App', providedBy: 'User Authority' },
    vaultAccess: { enabled: false, providedBy: null }
  },
  'Support Tier 1': {
    workflows: [{ name: 'Denials management', policies: ['Queue Visibility'], providedBy: 'Support Tier 1' }],
    dashboards: { count: 1, items: ['Customer Success KPI'], providedBy: 'Support Tier 1' }
  },
  'Admin Authority': {
    workflows: [{ name: 'Eligibility authorization', policies: ['Regional Approval'], providedBy: 'Admin Authority' }],
    vaultAccess: { enabled: true, providedBy: 'Admin Authority' },
    neosEcosystem: { status: 'User', providedBy: 'Admin Authority' }
  },
  'Regional Compliance': {
    workflows: [{ name: 'Audit Workflow', policies: ['Full Read Access'], providedBy: 'Regional Compliance' }],
    dashboards: { count: 2, items: ['Regional Revenue', 'Staff Productivity'], providedBy: 'Regional Compliance' }
  }
};

const AVAILABLE_ROLES = Object.keys(ROLE_DEFINITION_LOOKUP);

const INITIAL_MOCK_GROUPS: RoleGroup[] = [
  { id: 'rg-global', name: 'Global Compliance', roles: ['Regional Compliance'] },
  { id: 'rg-support', name: 'Standard Support Pack', roles: ['Support Tier 1'] },
  { id: 'rg-exec', name: 'Executive Audit', roles: ['Regional Compliance', 'Support Tier 1'] }
];

const INITIAL_MOCK_DB: Record<string, UserDetail> = {
  'jane.cooper@element5.ai': {
    email: 'jane.cooper@element5.ai',
    found: true,
    assignedRoles: ['Admin Authority'],
    roleGroups: [INITIAL_MOCK_GROUPS[0]],
    tenants: ['Element 5', 'LHC', 'Graham', 'Maze', 'YV'],
    workflows: [
      { name: 'Eligibility authorization', policies: ['Regional Approval'], providedBy: 'Admin Authority' },
      { name: 'Audit Workflow', policies: ['Full Read Access'], providedBy: 'Regional Compliance' }
    ],
    vaultAccess: { enabled: true, providedBy: 'Admin Authority' },
    neosEcosystem: { status: 'User', providedBy: 'Admin Authority' },
    dashboards: { count: 2, items: ['Admin Overview', 'Regional Revenue'], providedBy: 'Regional Compliance' }
  },
  'cody.fisher@element5.ai': {
    email: 'cody.fisher@element5.ai',
    found: true,
    assignedRoles: ['User Authority'],
    roleGroups: [INITIAL_MOCK_GROUPS[1]],
    tenants: ['Element 5', 'Maze'],
    workflows: [
      { name: 'Claims processing', policies: ['Standard Workflow Only'], providedBy: 'User Authority' },
      { name: 'Denials management', policies: ['Queue Visibility'], providedBy: 'Support Tier 1' }
    ],
    vaultAccess: { enabled: false, providedBy: null },
    neosEcosystem: { status: 'App', providedBy: 'User Authority' },
    dashboards: { count: 1, items: ['Customer Success KPI'], providedBy: 'Support Tier 1' }
  },
  'j.wilson@element5.ai': {
    email: 'j.wilson@element5.ai',
    found: true,
    assignedRoles: ['Support Tier 1'],
    roleGroups: [],
    tenants: ['LHC'],
    workflows: [
      { name: 'Denials management', policies: ['Queue Visibility'], providedBy: 'Support Tier 1' }
    ],
    vaultAccess: { enabled: false, providedBy: null },
    neosEcosystem: { status: 'None', providedBy: null },
    dashboards: { count: 1, items: ['Customer Success KPI'], providedBy: 'Support Tier 1' }
  }
};

interface Props {
  onBack: () => void;
  selectedTenant: string;
}

export const BulkOperationsView: React.FC<Props> = ({ onBack, selectedTenant }) => {
  const [emailsInput, setEmailsInput] = useState('');
  const [results, setResults] = useState<UserDetail[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>(INITIAL_MOCK_GROUPS);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [activeUserMenu, setActiveUserMenu] = useState<string | null>(null);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedRolesForGroup, setSelectedRolesForGroup] = useState<string[]>([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const bulkMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveUserMenu(null);
      }
      if (bulkMenuRef.current && !bulkMenuRef.current.contains(event.target as Node)) {
        setIsBulkMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const emails = emailsInput.split(/[\s,;]+/).filter(e => e.trim().length > 0);
    const searchResults = emails.map(email => {
      const normalized = email.toLowerCase().trim();
      const existingUser = INITIAL_MOCK_DB[normalized];
      if (existingUser) return { ...existingUser };
      return { 
        email: email.trim(), found: false, assignedRoles: [], roleGroups: [], tenants: [], workflows: [],
        vaultAccess: { enabled: false, providedBy: null },
        neosEcosystem: { status: 'None' as const, providedBy: null },
        dashboards: { count: 0, items: [], providedBy: null }
      };
    });
    setResults(searchResults);
    setHasSearched(true);
  };

  const filteredRoleGroups = useMemo(() => {
    return roleGroups.filter(group => {
      const matchesText = group.name.toLowerCase().includes(groupSearchQuery.toLowerCase());
      const matchesRole = !filterRole || group.roles.includes(filterRole);
      const matchesPolicy = groupSearchQuery.length > 3 && group.roles.some(role => {
        const def = ROLE_DEFINITION_LOOKUP[role];
        return def?.workflows?.some((wf: any) => 
          wf.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) || 
          wf.policies.some((p: string) => p.toLowerCase().includes(groupSearchQuery.toLowerCase()))
        );
      });
      return (matchesText || matchesPolicy) && matchesRole;
    });
  }, [roleGroups, groupSearchQuery, filterRole]);

  const handleCreateAndAssignGroup = () => {
    if (!newGroupName || selectedRolesForGroup.length === 0) return;
    const newGroup: RoleGroup = { id: `rg-${Date.now()}`, name: newGroupName, roles: [...selectedRolesForGroup] };
    setRoleGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
    setSelectedRolesForGroup([]);
    setIsRoleDropdownOpen(false);
  };

  const handleToggleGroupForUser = (userEmail: string, group: RoleGroup) => {
    setResults(prev => prev.map(u => {
      if (u.email === userEmail) {
        const hasGroup = u.roleGroups.some(g => g.id === group.id);
        const nextGroups = hasGroup 
          ? u.roleGroups.filter(g => g.id !== group.id) 
          : [...u.roleGroups, group];
        return { ...u, roleGroups: nextGroups, found: true }; 
      }
      return u;
    }));
  };

  const handleBulkAssignGroup = (group: RoleGroup) => {
    setResults(prev => prev.map(u => {
      const hasGroup = u.roleGroups.some(g => g.id === group.id);
      if (!hasGroup) {
        return { ...u, roleGroups: [...u.roleGroups, group], found: true };
      }
      return u;
    }));
    setIsBulkMenuOpen(false);
  };

  const handleRemoveUserFromResult = (userEmail: string) => {
    setResults(prev => prev.filter(u => u.email !== userEmail));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-20 relative">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-all shadow-sm">
          <ArrowLeft size={22} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-[32px] font-bold text-[#0F172A] tracking-tight">Role Groups & Bulk Ops</h2>
          <p className="text-slate-500 font-medium">Manage named role groups and multi-tenant assignments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm"><Mail size={24} /></div>
            <h3 className="text-xl font-bold text-slate-800">Target Identities</h3>
          </div>
          
          <div className="flex-1 min-h-[220px] bg-[#F8FAFC] border border-slate-100 rounded-[2rem] p-6 relative">
            <textarea
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              placeholder="Enter email IDs (one per line or comma separated)..."
              className="w-full h-full bg-transparent outline-none text-[16px] font-medium placeholder:text-slate-400 resize-none"
            />
            <div className="absolute bottom-4 right-4 left-4">
               <button onClick={handleSearch} className="w-full flex items-center justify-center gap-3 py-4 bg-[#4F46E5] text-white font-black uppercase tracking-widest text-[12px] rounded-2xl hover:bg-[#4338CA] transition-all shadow-xl shadow-indigo-100/50">
                <Search size={18} /> Search Users
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full overflow-visible">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm"><Layers size={24} /></div>
              <h3 className="text-xl font-bold text-slate-800">Existing Role Groups</h3>
            </div>
            <span className="text-xs font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">{filteredRoleGroups.length} Matches</span>
          </div>

          <div className="flex flex-col gap-3 mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 value={groupSearchQuery}
                 onChange={(e) => setGroupSearchQuery(e.target.value)}
                 placeholder="Filter groups or policies..."
                 className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
               />
             </div>
             <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Shield size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">All Roles</option>
                    {AVAILABLE_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {(groupSearchQuery || filterRole) && (
                  <button 
                    onClick={() => { setGroupSearchQuery(''); setFilterRole(''); }}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Clear Filters"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
             </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto min-h-[160px] pr-2 custom-scrollbar overflow-x-visible">
            {filteredRoleGroups.length > 0 ? filteredRoleGroups.map((group) => (
              <div key={group.id} className="group transition-all">
                <button 
                  onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${expandedGroup === group.id ? 'bg-[#EEF2FF] border-indigo-100 shadow-sm shadow-indigo-50' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${expandedGroup === group.id ? 'bg-white text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                      <Users size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-[15px] font-bold text-slate-900">{group.name}</div>
                      <div className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{group.roles.length} Roles Included</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className={`text-slate-300 transition-transform ${expandedGroup === group.id ? 'rotate-90 text-indigo-400' : ''}`} />
                </button>

                {expandedGroup === group.id && (
                  <div className="mt-2 px-4 py-6 bg-white border border-indigo-50 rounded-2xl animate-in slide-in-from-top-2 duration-200 space-y-6">
                    {group.roles.map(roleName => {
                      const def = ROLE_DEFINITION_LOOKUP[roleName];
                      return (
                        <div key={roleName} className="space-y-4 border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield size={14} className="text-indigo-400" />
                              <span className="text-[14px] font-bold text-slate-800">{roleName}</span>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-slate-100">
                              Active Policy
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                            <div className="space-y-2">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Workflow Logic</div>
                              {def.workflows?.map((wf: any, idx: number) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
                                    <GitBranch size={14} className="text-slate-400" /> {wf.name}
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {wf.policies.map((p: string) => (
                                      <span key={p} className="text-[9px] font-black text-indigo-600 bg-white border border-indigo-50 px-2 py-0.5 rounded-md uppercase">{p}</span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Compliance & Nodes</div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors ${def.vaultAccess?.enabled ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                                  <Lock size={16} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Vault</span>
                                </div>
                                <div className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors ${def.neosEcosystem?.status !== 'None' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                                  <Cpu size={16} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">NIOS</span>
                                </div>
                              </div>
                              <div className="mt-2 text-[10px] text-slate-400 font-bold italic text-center">* Context: {selectedTenant}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                 <Filter size={32} className="text-slate-200" />
                 <div className="text-sm font-bold text-slate-400">No role groups match your filters.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#F8FAFC] border border-slate-100 rounded-[3rem] p-10 overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end overflow-visible">
          <div className="lg:col-span-4 space-y-4">
            <label className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase ml-1">New Role Group Definition</label>
            <div className="relative">
              <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="e.g. Cluster Administrative Pack" className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-700 shadow-sm transition-all" />
            </div>
          </div>
          <div className="lg:col-span-4 space-y-4 relative overflow-visible">
            <label className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase ml-1">Encapsulated Roles</label>
            <div className="relative">
              <button onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)} className={`w-full flex items-center justify-between px-6 py-5 bg-white border rounded-2xl text-[15px] font-bold text-slate-700 transition-all ${isRoleDropdownOpen ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-none' : 'border-slate-200 shadow-sm hover:border-indigo-300'}`}>
                <div className="flex items-center gap-3 truncate">
                  <Shield size={18} className="text-indigo-400" />
                  <span className="truncate">{selectedRolesForGroup.length > 0 ? `${selectedRolesForGroup.length} Roles Selected` : 'Select Included Roles'}</span>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isRoleDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden py-2 animate-in fade-in slide-in-from-top-1">
                  {AVAILABLE_ROLES.map(role => (
                    <button key={role} onClick={() => setSelectedRolesForGroup(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])} className="w-full px-6 py-3.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                      <span className="group-hover:text-indigo-600 transition-colors">{role}</span>
                      {selectedRolesForGroup.includes(role) ? (
                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-slate-200 rounded-full group-hover:border-indigo-200 transition-colors" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-4">
            <button onClick={handleCreateAndAssignGroup} disabled={!newGroupName || selectedRolesForGroup.length === 0} className={`w-full flex items-center justify-center gap-4 py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all shadow-xl active:scale-95 ${newGroupName && selectedRolesForGroup.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
              <PlusCircle size={20} /> Provision Group Context
            </button>
          </div>
        </div>
      </div>

      {hasSearched && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 overflow-visible">
           <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-3">
                <Fingerprint size={20} className="text-slate-400" />
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Identity Audit Results</h3>
             </div>
             
             <div className="flex items-center gap-4 relative overflow-visible">
                {results.length > 0 && (
                  <div className="relative" ref={bulkMenuRef}>
                    <button 
                      onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
                      className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                      <CheckCircle size={14} /> Assign to Existing Group
                    </button>
                    {isBulkMenuOpen && (
                      <div className="absolute top-full right-0 mt-3 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[200] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 origin-top-right">
                         <div className="px-4 py-2 border-b border-slate-50 mb-1">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apply to all {results.length} Identities</span>
                         </div>
                         <div className="max-h-[250px] overflow-y-auto">
                            {roleGroups.map(group => (
                              <button key={group.id} onClick={() => handleBulkAssignGroup(group)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group/item">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-400 group-hover/item:bg-indigo-100 group-hover/item:text-indigo-600 transition-colors"><Users size={16} /></div>
                                <span className="text-sm font-bold text-slate-700 group-hover/item:text-indigo-600">{group.name}</span>
                              </button>
                            ))}
                         </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">{results.length} Targeted Records</div>
             </div>
           </div>

           <div className="space-y-6 overflow-visible">
              {results.map((user, idx) => (
                <div key={idx} className={`bg-white border rounded-[3rem] overflow-visible shadow-sm transition-all animate-in slide-in-from-top-2 duration-300 relative ${!user.found ? 'border-red-100' : 'border-slate-100'} ${activeUserMenu === user.email ? 'z-[100]' : 'z-[10]'}`}>
                   <div className="px-10 py-6 flex items-center justify-between bg-white border-b border-slate-50 rounded-t-[3rem]">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${user.found ? 'bg-indigo-600' : 'bg-red-400'}`}>{user.email.charAt(0).toUpperCase()}</div>
                      <div className="flex flex-col">
                        <span className="text-[18px] font-extrabold text-[#0F172A] leading-tight">{user.email}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{user.found ? 'Verified Organizational Record' : 'Unprovisioned Identity'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {user.found ? (
                         <div className="flex items-center gap-2 text-[#166534] font-black text-[10px] uppercase tracking-widest bg-[#F0FDF4] px-5 py-2.5 rounded-2xl border border-[#DCFCE7] shadow-sm">
                          <CheckCircle2 size={14} /> Active Governance
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#991B1B] font-black text-[10px] uppercase tracking-widest bg-[#FEF2F2] px-5 py-2.5 rounded-2xl border border-[#FEE2E2] shadow-sm">
                          <AlertCircle size={14} /> Identity Gap Detected
                        </div>
                      )}
                      <div className="relative" ref={activeUserMenu === user.email ? menuRef : null}>
                        <button onClick={() => setActiveUserMenu(activeUserMenu === user.email ? null : user.email)} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95" title="Manage Membership">
                          <PlusCircle size={24} />
                        </button>
                        {activeUserMenu === user.email && (
                          <div className={`absolute right-0 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[300] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 ${idx === 0 ? 'top-full mt-3 origin-top-right' : 'bottom-full mb-3 origin-bottom-right'}`}>
                             <div className="px-4 py-2 border-b border-slate-50 mb-1">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign to Existing Group</span>
                             </div>
                             <div className="max-h-[250px] overflow-y-auto">
                                {roleGroups.map(group => {
                                  const isMember = user.roleGroups.some(g => g.id === group.id);
                                  return (
                                    <button key={group.id} onClick={() => handleToggleGroupForUser(user.email, group)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group/item text-left">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isMember ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}><Users size={16} /></div>
                                        <span className={`text-sm font-bold ${isMember ? 'text-indigo-600' : 'text-slate-700'}`}>{group.name}</span>
                                      </div>
                                      {isMember ? <Check size={16} className="text-indigo-600" /> : <Plus size={16} className="text-slate-300 opacity-0 group-hover/item:opacity-100" />}
                                    </button>
                                  )
                                })}
                             </div>
                             <div className="border-t border-slate-50 mt-2 pt-2">
                                <button onClick={() => handleRemoveUserFromResult(user.email)} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors">
                                   <UserMinus size={16} />
                                   <span className="text-sm font-bold">Remove from Action</span>
                                </button>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {user.found && user.roleGroups.length > 0 && (
                    <div className="p-10 bg-slate-50/30">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6"><Users size={14} /> Active Role Groupings</div>
                      <div className="flex flex-wrap gap-3">
                        {user.roleGroups.map(group => (
                          <div key={group.id} className="inline-flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in zoom-in-95">
                            <div>
                               <div className="text-[14px] font-bold text-slate-800">{group.name}</div>
                               <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{group.roles.join(', ')}</div>
                            </div>
                            <button onClick={() => handleToggleGroupForUser(user.email, group)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!user.found && (
                    <div className="p-16 flex flex-col items-center justify-center text-center space-y-6">
                       <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300"><UserX size={40} /></div>
                       <div className="space-y-2 max-w-sm">
                          <h4 className="text-xl font-bold text-slate-900">Identity Context Missing</h4>
                          <p className="text-sm text-slate-500 font-medium">Use the "Manage Membership" menu to assign this identity to a group and provision their access.</p>
                       </div>
                    </div>
                  )}
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};
