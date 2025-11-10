import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, LayoutDashboard, History, FileText, Settings, Info, HelpCircle, 
  User, Sun, LogOut, PanelLeftClose, X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Home', dataNav: 'home' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', dataNav: 'dashboard' },
    { path: '/history', icon: History, label: 'Riwayat', dataNav: 'history' },
    { path: '/settings', icon: Settings, label: 'Pengaturan', dataNav: 'settings' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-[#0b1220]/95 backdrop-blur-xl border-r border-white/10 z-50 transform transition-all duration-300 ease-in-out overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <img
                  src="/assets/img/logo-sitsense.svg"
                  alt="SitSense"
                  className="h-8 w-auto"
                />
                {!isCollapsed && (
                  <span className="text-xl font-bold tracking-tight">SitSense</span>
                )}
              </div>
              {/* Toggle button (Desktop) */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <PanelLeftClose className="h-5 w-5" />
              </button>
              {/* Close button (Mobile only) */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {!isCollapsed && (
              <p className="text-xs text-slate-400 mt-1">Smart Posture Monitor</p>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-nav={item.dataNav}
                  onClick={() => setIsMobileOpen(false)}
                  className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-white/10 text-cyan-300'
                      : 'hover:bg-white/5 hover:text-cyan-300'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/5 hover:text-cyan-300 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <User className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Profil</span>}
            </button>
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/5 hover:text-cyan-300 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <Sun className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Tema</span>}
            </button>
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/5 hover:text-red-300 text-red-400 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Keluar</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

