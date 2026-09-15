import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { UserRole } from '../types';
import { 
  ShoppingBag, 
  Layers, 
  Receipt, 
  Globe, 
  UtensilsCrossed, 
  Package, 
  Users, 
  Coins, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  FolderLock, 
  LogOut, 
  Wifi, 
  WifiOff, 
  Menu, 
  X,
  Languages
} from 'lucide-react';

export default function AppShell() {
  const { user, logout, hasRole } = useAuth();
  const { t, language, setLanguage, dir } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor network status for offline indicator
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav items configuration with role check restrictions
  const navItems = [
    { 
      path: '/', 
      label: t.sections.pos, 
      icon: ShoppingBag, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER] 
    },
    { 
      path: '/tables', 
      label: t.sections.tables, 
      icon: Layers, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER] 
    },
    { 
      path: '/orders', 
      label: t.sections.orders, 
      icon: Receipt, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER] 
    },
    { 
      path: '/online-orders', 
      label: t.sections.onlineOrders, 
      icon: Globe, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER],
      badge: 2 // Show notification count for accept/reject queue
    },
    { 
      path: '/products', 
      label: t.sections.products, 
      icon: UtensilsCrossed, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      path: '/inventory', 
      label: t.sections.inventory, 
      icon: Package, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      path: '/suppliers', 
      label: t.sections.suppliers, 
      icon: Users, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      path: '/expenses', 
      label: t.sections.expenses, 
      icon: Coins, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      path: '/reports', 
      label: t.sections.reports, 
      icon: BarChart3, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      path: '/staff', 
      label: t.sections.staff, 
      icon: ShieldAlert, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      path: '/settings', 
      label: t.sections.settings, 
      icon: Settings, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      path: '/audit', 
      label: t.sections.auditLog, 
      icon: FolderLock, 
      roles: [UserRole.ADMIN] 
    }
  ];

  // Filter paths user has permission to see
  const authorizedNavItems = navItems.filter(item => hasRole(item.roles));

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7EE] text-[#3E2A22]" dir={dir}>
      {/* Dynamic Top Navigation Bar */}
      <header className="bg-white border-b border-[#3E2A22] border-opacity-10 h-16 flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#3E2A22] hover:bg-[#FFF7EE]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#E54B2A] flex items-center justify-center text-[#FFF7EE] font-bold border border-[#F2B21B]">
              C
            </span>
            <span className="font-extrabold text-[#E54B2A] text-lg tracking-tight hidden sm:inline">
              Cripsy Chicken
            </span>
          </div>
        </div>

        {/* Center: System Connectivity & Session State */}
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          {/* Real-time Connection badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold ${
            isOnline 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-red-50 text-[#E54B2A] border border-red-200 animate-pulse'
          }`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? (language === 'ar' ? 'متصل' : 'ONLINE') : (language === 'ar' ? 'أوفلاين' : 'OFFLINE MODE')}</span>
          </div>

          {/* Active Cash Register state (concept for openings) */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF1DE] border border-[#F2B21B] text-[#3E2A22] rounded-full font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{language === 'ar' ? 'جلسة الصندوق مفتوحة' : 'Register Session Active'}</span>
          </div>
        </div>

        {/* Right side: Language, User details, and Logout */}
        <div className="flex items-center gap-3">
          {/* Quick Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1 p-2 rounded-lg hover:bg-[#FFF7EE] text-[#3E2A22] transition-colors border border-[#3E2A22] border-opacity-5"
            title="Toggle Language"
          >
            <Languages className="w-4 h-4 text-[#E54B2A]" />
            <span className="text-xs font-bold uppercase hidden sm:inline">
              {language === 'en' ? 'العربية' : 'English'}
            </span>
          </button>

          {/* User profile details */}
          {user && (
            <div className="flex items-center gap-2 border-l border-r border-[#3E2A22] border-opacity-10 px-3 hidden sm:flex">
              <div className="text-right">
                <p className="text-xs font-bold leading-tight text-[#3E2A22]">{user.name}</p>
                <p className="text-[10px] text-gray-500 font-semibold tracking-wider">{user.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#3E2A22] text-white flex items-center justify-center font-bold text-xs uppercase">
                {user.name.charAt(0)}
              </div>
            </div>
          )}

          {/* Secure Logout Trigger */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-500 hover:text-[#E54B2A] hover:bg-red-50 transition-colors"
            title={language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative min-h-0">
        {/* Desktop Sidebar (Dynamic side layout) */}
        <aside className="hidden md:block w-64 bg-white border-r border-[#3E2A22] border-opacity-10 overflow-y-auto p-4 shrink-0">
          <nav className="space-y-1">
            {authorizedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-all group ${
                    isActive
                      ? 'bg-[#E54B2A] text-white shadow-xs'
                      : 'text-[#3E2A22] hover:bg-[#FFF7EE] opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#E54B2A] group-hover:scale-105 transition-transform'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${isActive ? 'bg-white text-[#E54B2A]' : 'bg-[#E54B2A] text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Flyout Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Overlay backdrop */}
            <div 
              className="fixed inset-0 bg-black/45 backdrop-blur-xs" 
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer container */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-[#3E2A22] border-opacity-10 p-4 pt-16 h-full z-10 overflow-y-auto">
              <nav className="space-y-1">
                {authorizedNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-[#E54B2A] text-white shadow-xs'
                          : 'text-[#3E2A22] hover:bg-[#FFF7EE] opacity-90'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#E54B2A]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full font-bold bg-[#E54B2A] text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Render Section */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FFF7EE]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
