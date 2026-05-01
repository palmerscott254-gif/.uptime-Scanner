import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils';

interface FilterDropdownProps {
  label?: string;
  options: string[];
  value?: string;
  onChange?: (v: string) => void;
}

export function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function docClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', docClick);
    return () => document.removeEventListener('click', docClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{label ?? (value || 'Select')}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-white/10 bg-app-card p-2 shadow-lg">
          <ul className="max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  className={cn('w-full text-left rounded-md px-3 py-2 text-sm hover:bg-white/5', value === opt && 'bg-white/5')}
                  onClick={() => {
                    onChange?.(opt);
                    setOpen(false);
                  }}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
