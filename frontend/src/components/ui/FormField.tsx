import { useId } from 'react';
import { ErrorMark, FieldError } from './FieldError';

interface FormFieldProps {
  label: string;
  required?: boolean;
  /** Validation message; turns the label, outline and placeholder red */
  error?: string;
  /** Renders the control; receives the id to put on it so the label is linked */
  children: (id: string) => React.ReactNode;
  className?: string;
}

export function FormField({ label, required, error, children, className = '' }: FormFieldProps) {
  const id = useId();
  return (
    <div className={className} data-invalid={error ? 'true' : undefined}>
      <label htmlFor={id} className={`flex items-center gap-1.5 ${error ? 'text-danger-text' : ''}`}>
        {error && <ErrorMark />}
        {label}
        {required && !error && <span className="text-danger">*</span>}
      </label>
      {children(id)}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
