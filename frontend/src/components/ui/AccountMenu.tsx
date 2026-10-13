import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { Icon } from './Icon';

/**
 * The signed-in user at the end of the top bar: avatar and name. The menu says
 * who is signed in once (avatar, name, @username, email), then My profile and
 * Change password, with Sign out last and in red.
 */
export function AccountMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const handleLogout = () => { queryClient.clear(); logout(); navigate('/login', { replace: true }); };

  return (
    <div ref={ref} className="relative flex h-16 items-center border-s border-line ps-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('account.menu')}: ${user?.fullName ?? ''}`}
        className="inline-flex items-center gap-3 rounded-md px-2 py-1 text-start transition-colors duration-150 hover:bg-hover"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">{initial}</span>
        <span className="hidden min-w-0 leading-tight sm:block">
          <span className="block max-w-40 truncate text-sm font-semibold text-title">{user?.fullName}</span>
          {user?.userName && <span className="block max-w-40 truncate text-xs text-muted"><bdi>@{user.userName}</bdi></span>}
        </span>
        <Icon name="chevronDown" className={`hidden size-4 text-muted transition-transform duration-150 sm:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="absolute end-0 top-full z-50 mt-1 w-75 overflow-hidden rounded-lg border border-line bg-surface shadow-pop">
          <div className="flex items-start gap-3 border-b border-line bg-band p-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-on-primary">{initial}</span>
            <div className="min-w-0 text-sm text-muted">
              <p className="truncate text-base font-bold text-title">{user?.fullName}</p>
              {user?.userName && <p className="truncate"><bdi>@{user.userName}</bdi></p>}
              <p className="truncate"><bdi>{user?.email}</bdi></p>
            </div>
          </div>
          <div className="py-1">
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center gap-3 px-4 text-sm text-title transition-colors duration-150 hover:bg-hover"
            >
              <Icon name="profile" className="size-[18px]" />
              {t('account.myProfile')}
            </Link>
            <Link
              to="/account/password"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center gap-3 px-4 text-sm text-title transition-colors duration-150 hover:bg-hover"
            >
              <Icon name="key" className="size-[18px]" />
              {t('account.changePassword')}
            </Link>
          </div>
          <div className="border-t border-line py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex h-11 w-full items-center gap-3 px-4 text-start text-sm text-danger-text transition-colors duration-150 hover:bg-danger-soft"
            >
              <Icon name="logout" className="size-[18px] rtl:rotate-180" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
