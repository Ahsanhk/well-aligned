import { Sparkles } from 'lucide-react';
import { FOLDER_PICKER_COPY } from '@/constants/system';

interface Props {
  stack: string;
  onUse: () => void;
}

export function DetectedStackChip({ stack, onUse }: Props) {
  return (
    <button
      type="button"
      onClick={onUse}
      title={stack}
      className="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent transition-colors duration-150 hover:bg-accent/20"
    >
      <Sparkles size={11} className="shrink-0" />
      <span className="shrink-0 font-medium">{FOLDER_PICKER_COPY.useDetected}</span>
      <span className="truncate text-accent/70">{stack}</span>
    </button>
  );
}
