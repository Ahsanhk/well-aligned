import { ListPlus, TerminalSquare } from 'lucide-react';
import type { RunMode } from '@/types';

export function SendModeIcon({ mode, size = 14 }: { mode: RunMode; size?: number }) {
  return mode === 'terminal' ? <TerminalSquare size={size} className="text-violet" /> : <ListPlus size={size} className="text-accent" />;
}
