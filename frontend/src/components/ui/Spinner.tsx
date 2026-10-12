interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'size-4 border-2', md: 'size-8 border-2', lg: 'size-10 border-3' };

export function Spinner({ size = 'md', className = 'border-line border-t-primary' }: SpinnerProps) {
  return <span role="status" aria-label="Loading" className={`inline-block animate-spin rounded-full ${sizes[size]} ${className}`} />;
}

export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <Spinner size="lg" />
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}
