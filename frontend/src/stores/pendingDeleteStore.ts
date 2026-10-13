import { create } from 'zustand';

interface PendingDeleteState {
  /** Records deleted on screen whose delete has not been sent yet ("tasks:12"). */
  keys: ReadonlySet<string>;
  add: (key: string) => void;
  remove: (key: string) => void;
}

/**
 * Records hidden while their Undo toast is showing. Lists filter these out so a
 * background refetch during those seconds cannot bring the row back.
 */
export const usePendingDeleteStore = create<PendingDeleteState>((set) => ({
  keys: new Set(),
  add: (key) => set((s) => ({ keys: new Set(s.keys).add(key) })),
  remove: (key) => set((s) => {
    const keys = new Set(s.keys);
    keys.delete(key);
    return { keys };
  }),
}));

/** Hides rows of `section` whose delete is pending. */
export function useWithoutPending<T extends { id: number }>(section: string, rows: T[]): T[] {
  const keys = usePendingDeleteStore((s) => s.keys);
  return keys.size ? rows.filter((row) => !keys.has(`${section}:${row.id}`)) : rows;
}
