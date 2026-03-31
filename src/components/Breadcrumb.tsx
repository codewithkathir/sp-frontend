import { useLocation, Link } from 'react-router-dom';

export function Breadcrumb() {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    const breadcrumbMap: { [key: string]: string } = {
      '': 'Dashboard',
      'projects': 'Projects',
      'tasks': 'Tasks',
      'kanban': 'Kanban Board',
      'users': 'Team Management',
      'profile': 'User Profile',
      'new': 'Create New',
      'edit': 'Edit',
      'settings': 'Settings'
    };

    return pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      let displayName = breadcrumbMap[name] || name;
      
      // Handle dynamic routes (like IDs)
      if (!isNaN(Number(name)) && index > 0) {
        const parentRoute = pathnames[index - 1];
        displayName = `${breadcrumbMap[parentRoute] || parentRoute} Details`;
      }
      
      return {
        name: displayName,
        path: routeTo,
        isLast
      };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  if (location.pathname === '/') {
    return null; // No breadcrumbs on dashboard
  }

  return (
    <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
      <Link 
        to="/" 
        className="flex items-center text-slate-500 hover:text-slate-700 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Home
      </Link>
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center">
          <span className="mx-2 text-slate-300">/</span>
          {breadcrumb.isLast ? (
            <span className="text-slate-900 font-medium">
              {breadcrumb.name}
            </span>
          ) : (
            <Link 
              to={breadcrumb.path}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
