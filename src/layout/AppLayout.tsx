import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { SidebarProvider } from '../context/SidebarContext';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="h-screen bg-slate-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="p-6 space-y-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
