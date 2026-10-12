import { CircleCheck, CircleX } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  ok: boolean;
  okLabel: string;
  failLabel: string;
}

export function StatusCheck({ ok, okLabel, failLabel }: Props) {
  const Icon = ok ? CircleCheck : CircleX;
  return (
    <li className="flex items-center gap-2 text-sm">
      <Icon size={15} className={cn('shrink-0', ok ? 'text-success' : 'text-warning')} />
      <span className={ok ? 'text-fg' : 'text-muted'}>{ok ? okLabel : failLabel}</span>
    </li>
  );
}
