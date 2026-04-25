import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, description, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        aria-label="Close modal overlay"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-app-card shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm text-gray-400">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="h-4 w-4" />}>
            Close
          </Button>
        </div>
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
