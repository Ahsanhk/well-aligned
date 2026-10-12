'use client';

import '@xterm/xterm/css/xterm.css';
import { useRef } from 'react';
import { RotateCcw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CLAUDE_COPY } from '@/constants/claude';
import { useTerminalSession } from '@/hooks/useTerminalSession';

export function TerminalView({ runId }: { runId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const session = useTerminalSession(runId, containerRef);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-terminal">
      <div ref={containerRef} className="min-h-0 flex-1 px-2 py-1.5" onClick={session.focus} />
      {session.state !== 'connected' && (
        <div className="animate-fade-in absolute inset-0 flex flex-col items-center justify-center gap-3 bg-canvas/70 px-6 text-center backdrop-blur-[2px]">
          {session.state === 'offline' ? (
            <>
              <WifiOff size={18} className="text-warning" />
              <p className="max-w-xs text-sm text-muted">{CLAUDE_COPY.offline}</p>
              <Button variant="secondary" size="sm" onClick={session.reconnect}>
                <RotateCcw size={13} />
                {CLAUDE_COPY.reconnect}
              </Button>
            </>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Spinner size={14} className="text-accent" />
              {session.state === 'reconnecting' ? CLAUDE_COPY.reconnecting : CLAUDE_COPY.connecting}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
