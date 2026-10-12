import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  src: string;
  alt: string;
  onOpen?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

const SIZES = {
  sm: 'h-10 w-14',
  md: 'h-20 w-28',
};

export function ScreenshotThumb({ src, alt, onOpen, onRemove, size = 'md' }: Props) {
  return (
    <div className={cn('group/thumb relative shrink-0 overflow-hidden rounded-lg border border-line bg-sunken', SIZES[size])}>
      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        aria-label={`Open ${alt}`}
        className="h-full w-full cursor-zoom-in disabled:cursor-default"
      >
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-200 group-hover/thumb:scale-105" />
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${alt}`}
          title="Remove"
          className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md bg-canvas/85 text-muted opacity-100 backdrop-blur transition-all duration-150 hover:bg-danger hover:text-canvas sm:opacity-0 sm:group-hover/thumb:opacity-100"
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
