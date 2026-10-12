interface CardProps {
  title?: React.ReactNode;
  /** Buttons or filters shown at the end of the header band */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Set false for tables that should touch the card edges */
  padded?: boolean;
}

/** Bordered panel with an optional gray header band and orange title (classic admin "box"). */
export function Card({ title, actions, children, className = '', padded = true }: CardProps) {
  return (
    <section className={`overflow-hidden rounded-lg border border-line bg-surface shadow-card ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-band px-5 py-3">
          {title && <h2 className="text-base font-bold text-accent">{title}</h2>}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}
