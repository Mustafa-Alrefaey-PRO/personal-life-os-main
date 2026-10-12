import { useEffect, useState } from 'react';
import { receiptService } from '../../services/receipt.service';
import { Icon } from './Icon';

interface ReceiptImageProps {
  receiptId: number;
  alt: string;
  className?: string;
  onClick?: (src: string) => void;
}

/**
 * Receipt images are private, so they're fetched with the auth header and shown through a
 * temporary object URL that is revoked on unmount.
 */
export function ReceiptImage({ receiptId, alt, className = '', onClick }: ReceiptImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    receiptService.getReceiptImage(receiptId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => { if (!cancelled) setFailed(true); });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [receiptId]);

  if (failed) {
    return (
      <div className={`flex items-center justify-center border border-line bg-band text-muted ${className}`}>
        <Icon name="image" className="size-5" />
      </div>
    );
  }

  if (!src) return <div className={`animate-pulse border border-line bg-band ${className}`} />;

  if (!onClick) return <img src={src} alt={alt} className={`border border-line object-cover ${className}`} />;

  return (
    <button type="button" onClick={() => onClick(src)} className="cursor-zoom-in" aria-label={alt}>
      <img src={src} alt={alt} className={`border border-line object-cover transition-opacity hover:opacity-80 ${className}`} />
    </button>
  );
}
