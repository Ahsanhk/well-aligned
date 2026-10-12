'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/Spinner';

export const ClaudeTerminal = dynamic(() => import('./TerminalView').then((module) => module.TerminalView), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-line bg-sunken">
      <Spinner className="text-accent" />
    </div>
  ),
});
