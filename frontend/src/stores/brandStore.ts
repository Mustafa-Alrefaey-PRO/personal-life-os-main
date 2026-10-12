import { create } from 'zustand';

export const BRANDS = ['ocean', 'navy', 'teal', 'graphite', 'burgundy'] as const;
export type Brand = (typeof BRANDS)[number];

// v2: earlier experiments are reset so everyone starts on the default blue
const STORAGE_KEY = 'brand-v2';

function readInitialBrand(): Brand {
  const saved = localStorage.getItem(STORAGE_KEY);
  return (BRANDS as readonly string[]).includes(saved ?? '') ? (saved as Brand) : 'ocean';
}

function applyBrand(brand: Brand) {
  // "ocean" is the default palette in index.css, so it needs no attribute
  if (brand === 'ocean') document.documentElement.removeAttribute('data-brand');
  else document.documentElement.setAttribute('data-brand', brand);
}

// Eagerly apply before React mounts (avoids a flash of the default color)
const initial = readInitialBrand();
applyBrand(initial);

interface BrandState {
  brand: Brand;
  setBrand: (brand: Brand) => void;
}

export const useBrandStore = create<BrandState>((set) => ({
  brand: initial,
  setBrand: (brand) => {
    localStorage.setItem(STORAGE_KEY, brand);
    applyBrand(brand);
    set({ brand });
  },
}));
