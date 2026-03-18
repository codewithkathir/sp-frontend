import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { Breadcrumb } from './Breadcrumb';
import { Menu } from 'lucide-react';

export function Topbar() {
  const { user } = useAuth();
  const { toggleSidebar } = useSidebar();
  
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
      <div className="flex items-center space-x-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} className="text-slate-600" />
        </button>
        <Breadcrumb />
      </div>
      <div className="text-right">
        <h2 className="text-lg font-semibold text-slate-900">{user?.name ?? 'User'}</h2>
      </div>
    </header>
  );
}
