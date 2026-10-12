import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

export interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
}

const MENU_MAX_HEIGHT = 240;

export function AppSelect({ value, onChange, options, placeholder = '', id }: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find(o => o.value === value && o.value !== '');

  // The menu is portalled to <body> (so modals can't clip it) and positioned under the button,
  // flipping above when there isn't room below.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < MENU_MAX_HEIGHT + 8 && rect.top > spaceBelow;
      setMenuStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        ...(openUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Highlight the current selection whenever the menu opens
  const openMenu = () => {
    const idx = options.findIndex(o => o.value === value);
    setHighlightedIdx(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const choose = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === 'Escape') {
      // Close only the menu, not a surrounding modal
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      return;
    }
    if (e.key === 'Tab') { setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIdx(i => Math.min(i + 1, options.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIdx >= 0 && highlightedIdx < options.length) choose(options[highlightedIdx].value);
    }
  };

  return (
    <div className="relative w-full">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex min-h-13 w-full items-center justify-between gap-2 rounded-md border bg-input px-3 text-start text-[13px] font-semibold transition-colors ${
          open ? 'border-primary ring-3 ring-primary/20' : 'border-input-line hover:border-primary-hover'
        } ${selectedOption ? 'text-title' : 'text-muted'}`}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <Icon name="chevronDown" className={`size-4 shrink-0 text-title transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <ul ref={menuRef} role="listbox" style={menuStyle}
          className="brand-scroll z-[70] max-h-60 overflow-auto rounded-md border border-line bg-surface py-1 shadow-pop">
          {options.map((option, idx) => {
            const isSelected = option.value === value && option.value !== '';
            const isEmpty = option.value === '';
            return (
              <li key={option.value || '__placeholder__'} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseEnter={() => setHighlightedIdx(idx)}
                  onClick={() => choose(option.value)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-start text-[13px] font-semibold ${
                    idx === highlightedIdx ? 'bg-hover' : ''
                  } ${isSelected ? 'font-semibold text-primary' : isEmpty ? 'text-muted' : 'text-heading'}`}
                >
                  <span className="flex w-4 shrink-0 justify-center">{isSelected && <Icon name="check" className="size-3.5" />}</span>
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
    </div>
  );
}
