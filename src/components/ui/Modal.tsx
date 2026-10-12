'use client';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  headerAside?: ReactNode;
  size?: Size;
}

const SIZES: Record<Size, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

export function Modal({ open, title, description, onClose, children, footer, headerAside, size = 'md' }: Props) {
  useEscapeKey(onClose, open);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="animate-fade-in absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'animate-pop-in relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-2xl shadow-black/60 sm:rounded-2xl',
          SIZES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-fg">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerAside}
            <IconButton label="Close" size="sm" onClick={onClose}>
              <X size={16} />
            </IconButton>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
