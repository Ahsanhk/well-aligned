import type { Ref, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  mono?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ mono = false, className, ref, ...props }: Props) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full resize-y rounded-lg border border-line bg-sunken/70 px-3 py-2.5 text-sm leading-relaxed text-fg outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle',
        'focus:border-accent/60 focus:shadow-[0_0_0_3px_var(--color-accent-soft)]',
        mono && 'font-mono text-[13px]',
        className,
      )}
      {...props}
    />
  );
}
