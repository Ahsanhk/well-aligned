import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)] bg-[size:48px_48px] opacity-25" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
      <div className="relative flex w-full justify-center">{children}</div>
    </main>
  );
}
