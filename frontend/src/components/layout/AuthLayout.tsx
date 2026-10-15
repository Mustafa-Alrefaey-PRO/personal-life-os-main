import { useTranslation } from 'react-i18next';
import { ThemeSwitch } from '../ui/ThemeSwitch';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { LanguageMenu } from '../ui/LanguageMenu';
import { SITE } from '../../config/site';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  /** Link line under the form, e.g. "Don't have an account? Register" */
  footer: React.ReactNode;
}

/** Shared shell for the login and register pages: brand panel + bordered form box. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-page">
      {/* Brand panel (desktop) */}
      <aside className="hidden w-[42%] max-w-xl flex-col justify-between bg-primary-dark p-10 text-on-primary/85 lg:flex">
        <Logo size="lg" nameClassName="text-on-primary" />
        <div>
          <h2 className="text-3xl leading-tight font-semibold text-on-primary">{t('auth.tagline')}</h2>
          <ul className="mt-8 space-y-4">
            {(['tasks', 'bills', 'transactions', 'journal'] as const).map((key) => (
              <li key={key} className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-md border border-on-primary/20 bg-on-primary/10">
                  <Icon name={key} className="size-4 text-on-primary" />
                </span>
                <span className="text-sm">{t(`nav.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-on-primary/60">{t('common.builtBy', { name: SITE.ownerName })}</p>
      </aside>

      {/* Form side */}
      <main className="flex flex-1 flex-col">
        <div className="flex justify-end gap-2 p-4">
          <LanguageMenu />
          <ThemeSwitch />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-16">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden"><Logo /></div>

            <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
              <div className="border-b border-line bg-band px-6 py-4">
                <h1 className="text-2xl font-semibold text-title">{title}</h1>
                <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
              </div>
              <div className="p-6">{children}</div>
              <div className="border-t border-line bg-band px-6 py-3 text-center text-sm text-muted">{footer}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
