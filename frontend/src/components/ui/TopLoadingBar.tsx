import { useEffect, useState } from 'react';
import { useLoadingStore } from '../../stores/loadingStore';

/** Fast requests never show the bar; only waits longer than this do. */
const SHOW_AFTER_MS = 300;

type Phase = 'idle' | 'loading' | 'done';

/**
 * Thin progress line along the top of the page while the API is busy. It appears after
 * 300ms, creeps towards 90% (the real end is unknown), then fills and fades out.
 */
export function TopLoadingBar() {
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    let show: number | undefined;
    let reset: number | undefined;
    const unsubscribe = useLoadingStore.subscribe((state, previous) => {
      const busy = state.inFlight > 0;
      if (busy === previous.inFlight > 0) return;
      if (busy) {
        clearTimeout(reset);
        show = window.setTimeout(() => setPhase('loading'), SHOW_AFTER_MS);
      } else {
        clearTimeout(show);
        setPhase((current) => (current === 'loading' ? 'done' : current));
        reset = window.setTimeout(() => setPhase((current) => (current === 'done' ? 'idle' : current)), 600);
      }
    });
    return () => { unsubscribe(); clearTimeout(show); clearTimeout(reset); };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] transition-opacity duration-300 ${
        phase === 'loading' ? 'opacity-100' : phase === 'done' ? 'opacity-0 delay-200' : 'opacity-0'
      }`}
    >
      <div
        className={`h-full origin-left bg-primary rtl:origin-right ${
          phase === 'loading' ? 'animate-loading-creep' : phase === 'done' ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </div>
  );
}
