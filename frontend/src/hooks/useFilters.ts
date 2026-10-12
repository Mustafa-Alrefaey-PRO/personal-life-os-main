import { useState } from 'react';

/**
 * Draft/apply filter state: fields edit the draft, "Search" applies it, "Clear" resets both.
 * activeCount is the number of applied values that differ from their defaults (shown as "Filter (n)").
 */
export function useFilters<T extends Record<string, string>>(defaults: T) {
  const [draft, setDraftState] = useState<T>(defaults);
  const [applied, setApplied] = useState<T>(defaults);

  const setDraft = (patch: Partial<T>) => setDraftState((d) => ({ ...d, ...patch }));
  const apply = () => setApplied(draft);
  const clear = () => { setDraftState(defaults); setApplied(defaults); };
  const activeCount = (Object.keys(defaults) as (keyof T)[]).filter((k) => applied[k] !== defaults[k]).length;

  return { draft, setDraft, applied, apply, clear, activeCount };
}
