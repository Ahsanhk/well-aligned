import { Film } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatBytes } from '@/lib/images';

interface Props {
  file: File;
  progress: number;
  onCancel: () => void;
}

export function UploadProgress({ file, progress, onCancel }: Props) {
  const percent = Math.round(progress * 100);
  return (
    <div className="animate-fade-in flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-elevated text-accent">
          <Film size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg">{file.name}</p>
          <p className="text-xs text-muted tabular-nums">
            Uploading · {formatBytes(file.size * progress)} of {formatBytes(file.size)}
          </p>
        </div>
        <span className="font-mono text-sm text-accent tabular-nums">{percent}%</span>
      </div>
      <ProgressBar percent={percent} className="h-1.5" barClassName="bg-gradient-to-r from-accent to-indigo shadow-[0_0_12px_-2px_var(--color-accent)]" />
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel upload
        </Button>
      </div>
    </div>
  );
}
