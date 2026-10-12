'use client';

import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Kbd } from '@/components/ui/Kbd';
import { SHORTCUTS } from '@/constants/shortcuts';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import type { LightboxImage } from '@/types';

interface Props {
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function ImageLightbox({ images, index, onIndexChange, onClose }: Props) {
  const total = images.length;
  const current = images[index];
  const hasMany = total > 1;
  const step = (delta: number) => onIndexChange((index + delta + total) % total);

  useEscapeKey(onClose, Boolean(current));
  useKeyboardShortcut(SHORTCUTS.lightboxPrev, () => step(-1), { enabled: hasMany, allowInModal: true });
  useKeyboardShortcut(SHORTCUTS.lightboxNext, () => step(1), { enabled: hasMany, allowInModal: true });

  if (!current) return null;
  const src = current.src;

  return createPortal(
    <div className="animate-fade-in fixed inset-0 z-[60] flex flex-col bg-canvas/95 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Image preview">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-fg">{current.name}</p>
          <p className="text-xs text-subtle">
            {index + 1} / {total}{current.meta && ` · ${current.meta}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {hasMany && <Kbd keys={[...SHORTCUTS.lightboxPrev.label, ...SHORTCUTS.lightboxNext.label]} className="mr-2 hidden text-subtle sm:inline-flex" />}
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            aria-label="Open original"
            title="Open original"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-fg"
          >
            <ExternalLink size={16} />
          </a>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8" onClick={onClose}>
        <img
          key={current.id}
          src={src}
          alt={current.name}
          onClick={(event) => event.stopPropagation()}
          className="animate-pop-in max-h-full max-w-full rounded-lg border border-line object-contain shadow-2xl shadow-black/60"
        />
        {hasMany && (
          <>
            <IconButton
              label="Previous"
              onClick={(event) => {
                event.stopPropagation();
                step(-1);
              }}
              className="absolute left-3 border border-line bg-surface/80 backdrop-blur"
            >
              <ChevronLeft size={18} />
            </IconButton>
            <IconButton
              label="Next"
              onClick={(event) => {
                event.stopPropagation();
                step(1);
              }}
              className="absolute right-3 border border-line bg-surface/80 backdrop-blur"
            >
              <ChevronRight size={18} />
            </IconButton>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
