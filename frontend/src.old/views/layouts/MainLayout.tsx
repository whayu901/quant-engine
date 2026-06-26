/**
 * Main Layout - SOLID: Single Responsibility
 * Layout wrapper for authenticated pages
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Services } from '../../di/setup';
import {
  Home, FolderOpen, BarChart3, MessageSquare, FileText,
  Settings, Users, CreditCard, LogOut, Menu, X,
  Zap, Globe, ChevronDown, Bell
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main Layout Component
 * SOLID: Single Responsibility - Only handles layout structure
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const authController = Services.auth;

  const [authState, setAuthState] = useState(authController.getState());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = authController.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await authController.logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: Home,
      roles: ['admin', 'researcher', 'analyst', 'client']
    },
    {
      label: 'Projects',
      path: '/projects',
      icon: FolderOpen,
      roles: ['admin', 'researcher', 'analyst']
    },
    {
      label: 'Analysis',
      path: '/analysis',
      icon: BarChart3,
      roles: ['admin', 'researcher', 'analyst']
    },
    {
      label: 'Chat',
      path: '/chat',
      icon: MessageSquare,
      roles: ['admin', 'researcher', 'analyst', 'client']
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: FileText,
      roles: ['admin', 'researcher', 'analyst', 'client']
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      roles: ['admin', 'researcher', 'analyst', 'client']
    }
  ];

  const adminItems = [
    {
      label: 'Admin',
      path: '/admin',
      icon: Users,
      roles: ['admin', 'super_admin']
    },
    {
      label: 'Billing',
      path: '/billing',
      icon: CreditCard,
      roles: ['admin', 'super_admin']
    }
  ];

  const filteredNavItems = navigationItems.filter(item =>
    item.roles.includes(authState.user?.role || 'client')
  );

  const filteredAdminItems = adminItems.filter(item =>
    item.roles.includes(authState.user?.role || 'client')
  );

  const isActivePath = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="main-layout min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="top-nav bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-semibold text-lg hidden sm:inline">Qual Engine</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hidden sm:inline">
                96x Faster
              </span>
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 rounded-md relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Language selector */}
            <button className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100 rounded-md">
              <Globe size={16} />
              <span className="text-sm hidden sm:inline">EN</span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {authState.user?.firstName?.[0] || 'U'}
                </div>
                <span className="text-sm hidden sm:inline">{authState.user?.firstName}</span>
                <ChevronDown size={16} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold">{authState.user?.fullName}</p>
                    <p className="text-xs text-gray-500">{authState.user?.email}</p>
                  </div>
                  <button
                    onClick={() => navigate('/settings/profile')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => navigate('/settings/api-keys')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    API Keys
                  </button>
                  <div className="border-t border-gray-200 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50 pt-16">
          <div className="bg-white w-64 h-full shadow-lg">
            <nav className="p-4">
              <div className="space-y-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActivePath(item.path)
                          ? 'bg-velocity-blue text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
                {filteredAdminItems.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    {filteredAdminItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                            isActivePath(item.path)
                              ? 'bg-velocity-blue text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Icon size={20} />
                          {item.label}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`sidebar hidden lg:block fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <nav className="p-4">
          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-velocity-blue text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}

            {filteredAdminItems.length > 0 && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                {filteredAdminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActivePath(item.path)
                          ? 'bg-velocity-blue text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <Icon size={20} />
                      {sidebarOpen && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </nav>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-4 right-4 p-2 hover:bg-gray-100 rounded-md"
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className={`main-content pt-16 transition-all ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};