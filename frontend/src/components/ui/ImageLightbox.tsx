import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

/** Full-screen image viewer; click outside, the close button or Escape closes it. */
export function ImageLightbox({ image, onClose }: { image: { src: string; title: string } | null; onClose: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [image, onClose]);

  if (!image) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('common.close')}
        className="absolute end-4 top-4 inline-flex size-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white hover:bg-white/20"
      >
        <Icon name="x" className="size-5" />
      </button>
      <figure className="flex max-h-[90vh] max-w-4xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img src={image.src} alt={image.title} className="max-h-[85vh] max-w-full rounded-md border border-white/10 object-contain shadow-2xl" />
        <figcaption className="mt-3 text-center text-sm font-semibold text-white">{image.title}</figcaption>
      </figure>
    </div>
  );
}
