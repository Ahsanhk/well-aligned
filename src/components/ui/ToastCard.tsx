import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'success' | 'danger';

interface Props {
  message: string;
  tone: Tone;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
}

const TONE_ICONS = { default: Info, success: CircleCheck, danger: CircleAlert };

const TONE_CLASSES: Record<Tone, string> = {
  default: 'text-accent',
  success: 'text-success',
  danger: 'text-danger',
};

export function ToastCard({ message, tone, actionLabel, onAction, onDismiss }: Props) {
  const Icon = TONE_ICONS[tone];
  return (
    <div
      role="status"
      className="animate-slide-up pointer-events-auto flex w-full items-center gap-3 rounded-xl border border-line-strong bg-elevated py-2.5 pr-2 pl-3.5 shadow-2xl shadow-black/50"
    >
      <Icon size={16} className={cn('shrink-0', TONE_CLASSES[tone])} />
      <p className="min-w-0 flex-1 text-sm text-fg">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-accent hover:bg-accent-soft"
        >
          {actionLabel}
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="shrink-0 cursor-pointer rounded-md p-1 text-subtle hover:bg-line/60 hover:text-fg"
      >
        <X size={14} />
      </button>
    </div>
  );
}
