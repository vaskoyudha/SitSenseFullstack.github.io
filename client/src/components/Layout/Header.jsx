import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wifi, User, Sun, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDevice } from '../../context/DeviceContext';
import Sidebar from './Sidebar';

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { connectionStatus } = useDevice();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/history', label: 'Riwayat' },
    { path: '/settings', label: 'Pengaturan' },
  ];

  return (
    <>
      <Sidebar />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/80 backdrop-blur-xl md:ml-64">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Brand */}
          <Link to="/dashboard" className="inline-flex items-center gap-2 hover:opacity-90">
            <img src="/assets/img/logo-sitsense.svg" alt="SitSense" className="h-7 w-auto" />
            <span className="text-lg font-semibold tracking-tight hidden sm:inline">SitSense</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-2 text-xs">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1 rounded-full transition-colors ${
                  location.pathname === item.path
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 hover:bg-white/10 transition-colors">
              <Sun className="h-4 w-4" />
              <span>Mode</span>
            </button>
          </nav>

          {/* Status chips */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span
              className={`badge inline-flex items-center gap-1 border ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <Wifi className="h-3.5 w-3.5" />
              <span>Wi‑Fi: {connectionStatus === 'connected' ? 'Tersambung' : 'Terputus'}</span>
            </span>
            <span className="badge inline-flex items-center gap-1 bg-white/5 border border-white/10">
              <User className="h-3.5 w-3.5" />
              <span>Auth: {user ? 'Masuk' : '—'}</span>
            </span>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

