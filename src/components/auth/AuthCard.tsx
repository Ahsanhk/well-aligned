import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { Card } from '@/components/ui/Card';
import { AUTH_COPY } from '@/constants/auth';

interface Props {
  title: string;
  subtitle: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, footer, children }: Props) {
  return (
    <div className="animate-pop-in flex w-full max-w-[400px] flex-col items-center gap-7">
      <BrandMark />
      <Card className="relative w-full overflow-hidden border-line-strong/70 bg-surface/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-indigo/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 p-6 sm:p-8">
          <header className="flex flex-col gap-1.5">
            <h1 className="text-xl font-semibold tracking-tight text-fg">{title}</h1>
            <p className="text-sm text-muted">{subtitle}</p>
          </header>
          {children}
        </div>
      </Card>
      {footer}
      <p className="flex items-center gap-1.5 text-xs text-subtle">
        <Lock size={11} />
        {AUTH_COPY.footer}
      </p>
    </div>
  );
}
