'use client';

import { useState } from 'react';
import { Film, RotateCcw, X } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { MEETING_COPY } from '@/constants/meetings';
import { frameUrl } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import type { SuggestionFrame } from '@/types';

interface Props {
  meetingId: string;
  frames: SuggestionFrame[];
  includedIds: string[];
  onChange: (frameIds: string[]) => void;
}

export function SuggestionFrames({ meetingId, frames, includedIds, onChange }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (frames.length === 0) return null;

  const toggle = (frameId: string) =>
    onChange(
      includedIds.includes(frameId)
        ? includedIds.filter((id) => id !== frameId)
        : frames.map((frame) => frame.id).filter((id) => id === frameId || includedIds.includes(id)),
    );

  const images = frames.map((frame) => ({
    id: frame.id,
    src: frameUrl(meetingId, frame.id),
    name: `Frame at ${frame.timestamp}`,
    meta: includedIds.includes(frame.id) ? '' : MEETING_COPY.frameExcluded,
  }));

  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-center gap-1.5 text-[11px] text-subtle">
        <Film size={11} />
        {MEETING_COPY.framesLabel}
        <span className="text-subtle/70">· {MEETING_COPY.framesKept(includedIds.length, frames.length)}</span>
      </p>
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {frames.map((frame, index) => {
          const isIncluded = includedIds.includes(frame.id);
          return (
            <li
              key={frame.id}
              className={cn(
                'group/frame relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg border bg-sunken transition-all duration-150',
                isIncluded ? 'border-line hover:border-line-strong' : 'border-dashed border-line opacity-45',
              )}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`Open frame at ${frame.timestamp}`}
                className="h-full w-full cursor-zoom-in"
              >
                <img
                  src={images[index].src}
                  alt={images[index].name}
                  loading="lazy"
                  className={cn(
                    'h-full w-full object-cover transition-[transform,filter] duration-200 group-hover/frame:scale-105',
                    !isIncluded && 'grayscale',
                  )}
                />
              </button>
              <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-canvas/80 px-1.5 py-px font-mono text-[10px] text-fg/90 tabular-nums backdrop-blur">
                {frame.timestamp}
              </span>
              {!isIncluded && (
                <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[10px] font-medium tracking-wider text-fg uppercase">
                  {MEETING_COPY.frameExcluded}
                </span>
              )}
              <button
                type="button"
                onClick={() => toggle(frame.id)}
                aria-label={isIncluded ? MEETING_COPY.excludeFrame : MEETING_COPY.includeFrame}
                title={isIncluded ? MEETING_COPY.excludeFrame : MEETING_COPY.includeFrame}
                aria-pressed={!isIncluded}
                className={cn(
                  'absolute top-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-canvas/85 backdrop-blur transition-all duration-150',
                  isIncluded
                    ? 'text-muted opacity-100 hover:bg-danger hover:text-canvas sm:opacity-0 sm:group-hover/frame:opacity-100 sm:focus-visible:opacity-100 pointer-coarse:opacity-100'
                    : 'text-accent opacity-100 hover:bg-accent hover:text-accent-fg',
                )}
              >
                {isIncluded ? <X size={12} strokeWidth={2.5} /> : <RotateCcw size={12} />}
              </button>
            </li>
          );
        })}
      </ul>
      {openIndex !== null && (
        <ImageLightbox images={images} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
      )}
    </div>
  );
}
