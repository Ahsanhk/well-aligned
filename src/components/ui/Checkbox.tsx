import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, className }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={onChange}
      className={cn(
        'flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-all duration-150',
        checked
          ? 'border-accent bg-accent text-accent-fg shadow-[0_0_10px_-2px_var(--color-accent)]'
          : 'border-line-strong bg-sunken hover:border-muted',
        className,
      )}
    >
      {checked && <Check size={12} strokeWidth={3} />}
    </button>
  );
}
