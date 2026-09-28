import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Boxes,
  ChevronLeft,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  X,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useSidebarStore } from '../store/sidebarStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { NAV_SECTIONS } from '../config/navConfig';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import api from '../api/client';

function Brand({ collapsed }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-5', collapsed && 'justify-center px-2')}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30">
        <Boxes className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">Stockify</p>
          <p className="truncate text-[10px] font-medium uppercase tracking-widest text-brand-500">
            Inventory System
          </p>
        </div>
      )}
    </div>
  );
}

function SidebarContent({ collapsed }) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
      {NAV_SECTIONS.map(({ section, items }) => {
        const visible = items.filter((i) => !i.permission || hasPermission(i.permission));
        if (visible.length === 0) return null;
        return (
          <div key={section}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {section}
              </p>
            )}
            <div className="space-y-0.5">
              {visible.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      collapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-brand-600/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200'
                    )
                  }
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function UserFooter({ collapsed }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', { refreshToken: useAuthStore.getState().refreshToken });
    } catch {
      // abaikan error logout di server
    }
    logout();
    toast.success('You have been logged out');
    navigate('/login');
  };

  return (
    <div className="border-t border-slate-200/70 p-3 dark:border-slate-700/50">
      <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
        <Avatar name={user?.name} src={user?.avatar} size="md" />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
            <Badge tone="violet" className="mt-0.5 capitalize">
              {user?.role?.replace(/_/g, ' ')}
            </Badge>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={handleLogout}
            title="Logout"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebarStore();
  const { theme, toggleTheme } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const close = () => setUserMenuOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-xl transition-all duration-300 dark:border-slate-700/50 dark:bg-[#0d1326]/90 lg:flex',
          collapsed ? 'w-[76px]' : 'w-64'
        )}
      >
        <Brand collapsed={collapsed} />
        <SidebarContent collapsed={collapsed} />
        <div className="relative">
          <button
            onClick={toggleCollapsed}
            className="absolute -right-3 top-0 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:text-brand-500 dark:border-slate-600 dark:bg-slate-800 lg:flex"
          >
            <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform duration-300', collapsed && 'rotate-180')} />
          </button>
          <UserFooter collapsed={collapsed} />
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-[#0d1326] lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            >
              <div className="flex items-center justify-between pr-3">
                <Brand />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent collapsed={false} />
              <UserFooter collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className={cn('flex min-h-screen flex-1 flex-col transition-all duration-300', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <header className="glass sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200/70 px-4 dark:border-slate-700/50 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Stockify</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-brand-500">Inventory System</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Avatar name={user?.name} src={user?.avatar} size="sm" />
                <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-pop dark:border-slate-700/50 dark:bg-[#0f1527]"
                  >
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700/50">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                      <p className="truncate text-xs text-slate-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <UserRound className="h-4 w-4" /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/login');
                        useAuthStore.getState().logout();
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
