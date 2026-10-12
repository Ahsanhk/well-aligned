'use client';

import { CircleAlert, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useMeetingsStore } from '@/store/meetings';
import type { Meeting } from '@/types';

export function MeetingFailedState({ meeting }: { meeting: Meeting }) {
  const retry = useMeetingsStore((state) => state.retry);
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-danger/25 bg-danger/5 px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
        <CircleAlert size={22} />
      </span>
      <div className="max-w-md">
        <p className="font-medium text-fg">Processing failed</p>
        {meeting.error && <p className="mt-1.5 text-sm leading-relaxed text-muted">{meeting.error}</p>}
      </div>
      <Button variant="secondary" onClick={() => void retry(meeting.id)}>
        <RotateCcw size={15} />
        Retry processing
      </Button>
    </div>
  );
}
