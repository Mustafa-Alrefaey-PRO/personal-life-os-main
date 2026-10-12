import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from './Icon';

interface PageHeaderProps {
  title: string;
  /** Icon shown in the breadcrumb strip */
  icon?: IconName;
  subtitle?: string;
  actions?: React.ReactNode;
  /** List page this one belongs to: adds "Parent » Title" to the breadcrumb and a round back button before the title */
  parent?: { label: string; to: string };
}

/**
 * Page header: a full-width gray strip with the breadcrumb,
 * then the page title with its actions on the same row.
 * The negative margins cancel <main>'s padding so the strip spans edge to edge.
 */
export function PageHeader({ title, icon = 'dashboard', subtitle, actions, parent }: PageHeaderProps) {
  const { t } = useTranslation();
  return (
    <>
      <nav aria-label="Breadcrumb" className="-mx-4 -mt-6 mb-6 flex h-10 items-center gap-2 bg-band px-4 text-[13px] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {parent && (
          <>
            <Link to={parent.to} className="flex items-center gap-2 text-muted transition-colors duration-150 hover:text-title">
              <Icon name={icon} className="size-4" />
              {parent.label}
            </Link>
            <span aria-hidden="true" className="text-muted">»</span>
          </>
        )}
        <Icon name={parent ? 'edit' : icon} className="size-4 text-title" />
        <span aria-current="page" className="font-bold text-title">{title}</span>
      </nav>
      <div className={`page-static mb-6 flex flex-wrap items-center justify-between gap-4 ${parent ? 'border-b border-line pb-3' : ''}`}>
        <div className="flex items-center gap-3">
          {parent && (
            <Link to={parent.to} title={t('common.back')} aria-label={t('common.back')}
              className="inline-flex size-8 items-center justify-center rounded-full border border-line-strong bg-surface text-title transition-colors duration-150 hover:bg-hover">
              <Icon name="chevronLeft" className="size-4 rtl:rotate-180" />
            </Link>
          )}
          <div>
            <h1 className="text-lg font-medium text-title">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </>
  );
}
