import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { useSidebarStore } from '../../stores/sidebarStore';
import { DarkModeToggle } from '../ui/DarkModeToggle';
import { RamadanBanner } from '../ui/RamadanBanner';
import { Icon, type IconName } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { LanguageMenu } from '../ui/LanguageMenu';
import { SITE } from '../../config/site';

interface MainLayoutProps { children: React.ReactNode }

const navItems: { to: string; key: IconName & ('dashboard' | 'tasks' | 'bills' | 'transactions' | 'receipts' | 'journal' | 'profile') }[] = [
  { to: '/dashboard', key: 'dashboard' },
  { to: '/tasks', key: 'tasks' },
  { to: '/bills', key: 'bills' },
  { to: '/transactions', key: 'transactions' },
  { to: '/receipts', key: 'receipts' },
  { to: '/journal', key: 'journal' },
  { to: '/profile', key: 'profile' },
];

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={`flex h-20 shrink-0 items-center gap-3 border-b border-sidebar-line ${collapsed ? 'justify-center' : 'px-6'}`}>
      <Logo withName={!collapsed} />
    </div>
  );
}

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { t } = useTranslation();
  return (
    // Collapsed menus are short, so overflow stays visible to let the hover tooltips show
    <nav className={`brand-scroll flex-1 space-y-1 py-5 pe-2 ${collapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
      {!collapsed && <p className="ps-4 pb-2 text-xs font-semibold tracking-wider text-sidebar-muted uppercase">{t('nav.menu')}</p>}
      {navItems.map(({ to, key }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          aria-label={collapsed ? t(`nav.${key}`) : undefined}
          className={({ isActive }) =>
            `group/item relative flex h-[51px] items-center gap-3 text-lg font-medium text-sidebar-text transition-colors duration-150 ${
              collapsed ? 'ms-2 justify-center rounded-xl' : 'rounded-e-xl ps-4'
            } ${isActive ? 'bg-sidebar-hover' : 'hover:bg-sidebar-hover hover:shadow-card'}`
          }
        >
          <Icon name={key} className="size-5 shrink-0" strokeWidth={1.75} />
          {collapsed ? (
            <span className="pointer-events-none absolute start-full z-50 ms-3 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium whitespace-nowrap text-title opacity-0 shadow-pop transition-opacity duration-150 group-hover/item:opacity-100">
              {t(`nav.${key}`)}
            </span>
          ) : (
            <span className="truncate">{t(`nav.${key}`)}</span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function UserMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const initial = user?.fullName?.charAt(0)?.toUpperCase() ?? 'U';

  const handleLogout = () => { queryClient.clear(); logout(); navigate('/login', { replace: true }); };

  return (
    <div className="flex h-16 items-center gap-3 border-s border-line ps-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong bg-band text-sm font-bold text-title">{initial}</span>
      <div className="hidden min-w-0 leading-tight sm:block">
        <p className="max-w-40 truncate text-sm font-semibold text-title">{user?.fullName}</p>
        <p className="max-w-40 truncate text-xs text-muted">{user?.email}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        title={t('nav.logout')}
        aria-label={t('nav.logout')}
        className="inline-flex size-10 items-center justify-center rounded-md text-title transition-colors duration-150 hover:bg-danger-soft hover:text-danger"
      >
        <Icon name="logout" className="size-4 rtl:rotate-180" />
      </button>
    </div>
  );
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed, toggle } = useSidebarStore();
  const isRTL = i18n.language === 'ar';

  // Where the content starts beside the sidebar, for overlays that line up with it (toasts).
  // Only while the app shell is on screen; the auth pages have no sidebar.
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => root.style.setProperty('--content-start', window.innerWidth >= 768 ? (collapsed ? '80px' : '278px') : '0px');
    apply();
    window.addEventListener('resize', apply);
    return () => { window.removeEventListener('resize', apply); root.style.removeProperty('--content-start'); };
  }, [collapsed]);

  return (
    <div className="flex min-h-screen bg-page text-body">
      {/* Desktop sidebar. z-[45] keeps its edge toggle above the content area (sticky creates its own layer) */}
      <aside className={`group/sidebar sticky top-0 z-[45] hidden h-screen shrink-0 flex-col border-e border-sidebar-line bg-sidebar transition-[width] duration-200 ease-linear md:flex ${collapsed ? 'w-20' : 'w-[278px]'}`}>
        <Brand collapsed={collapsed} />
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
          aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
          aria-expanded={!collapsed}
          className={`absolute -end-[18px] top-[62px] z-50 inline-flex size-9 items-center justify-center rounded-full border border-line-strong bg-band text-title transition-all duration-400 ease-in-out hover:bg-hover focus-visible:scale-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30 ${
            // Hidden until the sidebar is hovered; always visible when collapsed so it can be reopened
            collapsed ? '' : 'scale-95 opacity-0 group-hover/sidebar:scale-100 group-hover/sidebar:opacity-100'
          }`}
        >
          {/* Points toward the direction the sidebar will move; mirrored in RTL */}
          <Icon name="chevronLeft" strokeWidth={1.75} className={`size-5 transition-transform duration-200 ${collapsed !== isRTL ? 'rotate-180' : ''}`} />
        </button>
        <SidebarNav collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex bg-overlay md:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="animate-slide-in-start flex h-full w-[278px] flex-col border-e border-sidebar-line bg-sidebar" onClick={(e) => e.stopPropagation()}>
            <Brand collapsed={false} />
            <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 bg-surface px-4 sm:px-6">
          {/* Mobile only: opens the drawer (desktop uses the round toggle on the sidebar edge) */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t('nav.openMenu')}
            className="inline-flex size-10 items-center justify-center rounded-md text-title transition-colors duration-150 hover:bg-hover md:hidden"
          >
            <Icon name="menu" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <LanguageMenu />
            <DarkModeToggle />
            <UserMenu />
          </div>
        </header>

        {/* key re-triggers the enter animation on navigation */}
        <main key={location.pathname} className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* key on <main> restarts the staggered entrance on every navigation */}
          <div className="page-stagger w-full">
            <RamadanBanner />
            {children}
          </div>
        </main>

        <footer className="border-t border-line bg-surface px-6 py-4 text-center text-sm text-title">
          {t('common.copyright', { year: new Date().getFullYear() })}
          <span className="mx-2 text-line-strong">|</span>
          <span className="text-muted">{t('common.builtBy', { name: SITE.ownerName })}</span>
        </footer>
      </div>
    </div>
  );
};
