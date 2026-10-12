interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
}

/** Joined button group for filters; the active option is filled with the primary color. */
export function SegmentedControl<T extends string>({ value, onChange, options, label }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex overflow-hidden rounded-md border border-input-line bg-surface">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value || '__empty__'}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`h-13 border-input-line px-4 text-sm font-semibold transition-colors not-first:border-s ${
              active ? 'bg-primary-dark text-on-primary' : 'text-title hover:bg-hover'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
