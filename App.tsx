
import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { IdentityManagement } from './components/IdentityManagement';

const App: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB] text-[#111827]">
      {/* Sidebar - Fixed Left */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <div className="flex-1 p-8 md:p-14 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14">
              <h1 className="text-[42px] font-bold text-[#0F172A] tracking-tight mb-3">
                Identity Management
              </h1>
              <p className="text-xl text-slate-400 font-medium">
                Enterprise-grade user provisioning and RBAC governance console.
              </p>
            </div>

            <IdentityManagement />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
