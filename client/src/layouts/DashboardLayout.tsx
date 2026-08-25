import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  Wallet, 
  MessageSquare, 
  Lightbulb, 
  HeartPulse, 
  User, 
  ShieldAlert, 
  Users, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Sun, 
  Moon, 
  Check, 
  AlertCircle
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { user, token, loading, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030712] text-cyan-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Navigation Links definition
  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Budgets', href: '/budgets', icon: Wallet },
    { name: 'AI Assistant', href: '/ai', icon: MessageSquare },
    { name: 'AI Insights', href: '/insights', icon: Lightbulb },
    { name: 'Financial Health', href: '/financial-health', icon: HeartPulse },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const adminNavigation = [
    { name: 'Admin Overview', href: '/admin', icon: ShieldAlert },
    { name: 'Users List', href: '/admin/users', icon: Users },
    { name: 'Audit Trails', href: '/admin/audit-logs', icon: FileText },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getPageTitle = () => {
    const allLinks = [...userNavigation, ...adminNavigation];
    const match = allLinks.find(link => link.href === location.pathname);
    return match ? match.name : 'LaserPay';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-col`}>
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-cyan-500">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-white">Laser<span className="text-cyan-500">Pay</span></span>
          </Link>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
          <div>
            <span className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Workspace</span>
            <nav className="mt-2 space-y-1">
              {userNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-slate-800 text-white border-l-4 border-cyan-500'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive(item.href) ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin Section */}
          {user.role === 'ADMIN' && (
            <div>
              <span className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Administration</span>
              <nav className="mt-2 space-y-1">
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-slate-800 text-white border-l-4 border-cyan-500'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive(item.href) ? 'text-cyan-400' : 'text-slate-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Footer Account Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={user.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=LP"} 
              alt={user.name} 
              className="h-10 w-10 rounded-full object-cover border border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-800 text-slate-400 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-white">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-400" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-cyan-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay Menu */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Alerts & Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => markAllAsRead()}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-slate-500 text-xs">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            if (!n.read) markAsRead(n.id);
                          }}
                          className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-850 ${!n.read ? 'bg-slate-850/40' : ''}`}
                        >
                          <div className="flex gap-2.5">
                            <span className={`mt-0.5 rounded-full p-1 h-6 w-6 flex items-center justify-center shrink-0 ${
                              n.type === 'BUDGET_WARNING' ? 'bg-amber-950/40 text-amber-400' :
                              n.type === 'SUSPICIOUS_TX' ? 'bg-red-950/40 text-red-400' :
                              n.type === 'AI_INSIGHT' ? 'bg-cyan-950/40 text-cyan-400' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {n.type === 'SUSPICIOUS_TX' ? <AlertCircle className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold ${!n.read ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[9px] text-slate-500 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Toggle */}
            <div className="relative">
              <button 
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img 
                  src={user.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=LP"} 
                  alt={user.name} 
                  className="h-8 w-8 rounded-full border border-slate-700 object-cover"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-medium text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    My Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-slate-800 hover:text-red-300 text-left"
                  >
                    <LogOut className="h-3.5 w-3.5 text-red-400" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#030712]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
