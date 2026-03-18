import { NavLink } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, FolderKanban, Users, UserCircle, LogOut, BarChart3, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const allLinks = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['admin', 'user'] },
  { to: '/projects', label: 'Projects', icon: <FolderKanban size={18} />, roles: ['admin'] },
  { to: '/tasks', label: 'Tasks', icon: <KanbanSquare size={18} />, roles: ['admin'] },
  { to: '/kanban', label: 'Kanban', icon: <BarChart3 size={18} />, roles: ['admin', 'user'] },
  { to: '/users', label: 'Users', icon: <Users size={18} />, roles: ['admin'] },
  { to: '/profile', label: 'Profile', icon: <UserCircle size={18} />, roles: ['admin', 'user'] }
];

export function Sidebar() {
  const { logout, user } = useAuth();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const links = allLinks.filter(link => user?.role && link.roles.includes(user.role));

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50
        bg-slate-900 text-slate-50 min-h-screen 
        flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:w-16 lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4">
          <div className={`text-xl font-semibold transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            SprintBoard
          </div>
          {/* SB text for collapsed view - both desktop and mobile */}
          <div className={`
            ${isSidebarOpen ? 'hidden' : 'block'} text-center flex-1 relative group
          `}>
            <div className="text-xl font-semibold">SB</div>
            {/* Tooltip for SB */}
            <div className={`
              absolute left-full top-1/2 -translate-y-1/2 ml-2
              px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 
              group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
              whitespace-nowrap z-[60] shadow-lg
            `}>
              SprintBoard
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-800"></div>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-lg hover:bg-slate-800 transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="space-y-2 flex-1 px-2 overflow-y-auto">
          {links.map((link) => (
            <div
              key={link.to}
              className="group relative"
              onTouchStart={(e) => {
                if (!isSidebarOpen) {
                  e.currentTarget.classList.add('touch-active');
                }
              }}
              onTouchEnd={(e) => {
                if (!isSidebarOpen) {
                  setTimeout(() => {
                    e.currentTarget.classList.remove('touch-active');
                  }, 1000);
                }
              }}
            >
              <NavLink
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) closeSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors ${
                    isActive ? 'bg-slate-800' : ''
                  } ${!isSidebarOpen ? 'justify-center lg:justify-center' : ''}`
                }
              >
                <div className="flex-shrink-0">
                  {link.icon}
                </div>
                <span className={`${!isSidebarOpen ? 'hidden lg:hidden' : ''} whitespace-nowrap`}>
                  {link.label}
                </span>
              </NavLink>
              {/* Tooltip */}
              <div className={`
                absolute left-full lg:left-full top-1/2 -translate-y-1/2 ml-2 lg:ml-2
                px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 
                group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                whitespace-nowrap z-[60] shadow-lg
                ${!isSidebarOpen ? 'block' : 'hidden'}
                group-[.touch-active]:opacity-100
              `}>
                {link.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-800"></div>
              </div>
            </div>
          ))}
        </nav>
        
        <div className="p-2">
          <button 
            onClick={logout} 
            className="group flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors relative"
            onTouchStart={(e) => {
              if (!isSidebarOpen) {
                e.currentTarget.classList.add('touch-active');
              }
            }}
            onTouchEnd={(e) => {
              if (!isSidebarOpen) {
                setTimeout(() => {
                  e.currentTarget.classList.remove('touch-active');
                }, 1000);
              }
            }}
          >
            <div className="flex-shrink-0">
              <LogOut size={18} />
            </div>
            <span className={`${!isSidebarOpen ? 'hidden lg:hidden' : ''} whitespace-nowrap`}>
              Logout
            </span>
            {/* Tooltip */}
            <div className={`
              absolute left-full lg:left-full top-1/2 -translate-y-1/2 ml-2 lg:ml-2
              px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 
              group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
              whitespace-nowrap z-[60] shadow-lg
              ${!isSidebarOpen ? 'block' : 'hidden'}
              group-[.touch-active]:opacity-100
            `}>
              Logout
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-800"></div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
