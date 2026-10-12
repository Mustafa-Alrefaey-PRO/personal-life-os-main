import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from './Icon';
import { ErrorMark, FieldError } from './FieldError';

interface AuthFieldProps {
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  /** Leading icon inside the field */
  icon: IconName;
  placeholder?: string;
  autoComplete?: string;
  /** Validation message; turns the label, icon, outline and placeholder red */
  error?: string;
}

/** Labelled input for the auth forms with a leading icon; password fields get a show/hide toggle. */
export function AuthField({ label, type, value, onChange, icon, placeholder, autoComplete, error }: AuthFieldProps) {
  const { t } = useTranslation();
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div data-invalid={error ? 'true' : undefined}>
      <label htmlFor={id} className={`flex items-center gap-1.5 ${error ? 'text-danger-text' : ''}`}>
        {error && <ErrorMark />}
        {label}
      </label>
      <div className="relative">
        <Icon name={icon} strokeWidth={1.5}
          className={`pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 ${error ? 'text-danger-text' : 'text-title'}`} />
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`ps-11 ${isPassword ? 'pe-11' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
            className={`absolute inset-y-0 end-0 flex items-center px-3 ${error ? 'text-danger-text' : 'text-title'} hover:opacity-80`}
          >
            <Icon name={visible ? 'eye' : 'eyeOff'} className="size-5" strokeWidth={1.5} />
          </button>
        )}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
