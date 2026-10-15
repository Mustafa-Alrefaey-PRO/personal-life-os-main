import { create } from 'zustand';

interface LoadingState {
  /** Requests currently waiting for the API. */
  inFlight: number;
  start: () => void;
  stop: () => void;
}

/** Counts API requests in flight; drives the thin loading bar at the top of the page. */
export const useLoadingStore = create<LoadingState>((set) => ({
  inFlight: 0,
  start: () => set((state) => ({ inFlight: state.inFlight + 1 })),
  stop: () => set((state) => ({ inFlight: Math.max(0, state.inFlight - 1) })),
}));
