import { ImageUp } from 'lucide-react';
import { COPY } from '@/constants/app';

export function DropOverlay({ visible, label = COPY.composerDropHint }: { visible: boolean; label?: string }) {
  if (!visible) return null;
  return (
    <div className="animate-fade-in pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] border-2 border-dashed border-accent/70 bg-canvas/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-accent">
        <ImageUp size={18} />
        {label}
      </div>
    </div>
  );
}
