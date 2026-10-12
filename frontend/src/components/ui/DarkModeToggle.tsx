import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../stores/themeStore';
import { Icon } from './Icon';

interface DarkModeToggleProps {
  /** "sidebar" styles it for the navy sidebar; default is for light surfaces */
  className?: string;
}

export const DarkModeToggle = ({ className = 'text-accent hover:bg-hover' }: DarkModeToggleProps) => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const label = isDarkMode ? t('theme.toLight') : t('theme.toDark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={`inline-flex size-10 items-center justify-center rounded-md transition-colors duration-150 ${className}`}
    >
      <Icon name="sun" className="size-5" strokeWidth={1.5} />
    </button>
  );
};
