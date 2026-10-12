'use client';

import { useState } from 'react';
import { THUMBNAIL_PREVIEW_LIMIT } from '@/constants/app';
import { screenshotUrl } from '@/lib/api-client';
import type { Screenshot } from '@/types';
import { ScreenshotLightbox } from './ScreenshotLightbox';
import { ScreenshotThumb } from './ScreenshotThumb';

export function ScreenshotStrip({ screenshots }: { screenshots: Screenshot[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (screenshots.length === 0) return null;
  const visible = screenshots.slice(0, THUMBNAIL_PREVIEW_LIMIT);
  const hidden = screenshots.length - visible.length;

  return (
    <div className="flex items-center gap-1.5">
      {visible.map((shot, index) => (
        <ScreenshotThumb
          key={shot.id}
          size="sm"
          src={screenshotUrl(shot.id)}
          alt={shot.originalName}
          onOpen={() => setOpenIndex(index)}
        />
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setOpenIndex(THUMBNAIL_PREVIEW_LIMIT)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-line bg-elevated text-xs text-muted hover:text-fg"
        >
          +{hidden}
        </button>
      )}
      {openIndex !== null && (
        <ScreenshotLightbox
          screenshots={screenshots}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
