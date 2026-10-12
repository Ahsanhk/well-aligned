import Link from 'next/link';
import { SquareTerminal } from 'lucide-react';
import { APP_META, ROUTES } from '@/constants/app';

export function BrandMark({ label = APP_META.name }: { label?: string }) {
  return (
    <Link href={ROUTES.home} className="group flex min-w-0 items-center gap-2.5 rounded-lg">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-elevated text-accent shadow-[0_0_16px_-6px_var(--color-accent)] transition-shadow duration-200 group-hover:shadow-[0_0_20px_-4px_var(--color-accent)]">
        <SquareTerminal size={15} />
      </span>
      <span className="truncate text-sm font-semibold tracking-tight text-fg">{label}</span>
    </Link>
  );
}
