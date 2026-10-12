import Link from 'next/link';
import { ImageIcon, Sparkles, Video } from 'lucide-react';
import { ownerMeetingRoute, todoOwner } from '@/lib/owner';
import { isSelfItem } from '@/lib/todo-origin';
import { quoteTimestamp } from '@/lib/todo-preview';
import type { Todo } from '@/types';
import { CategoryLabel } from './CategoryLabel';

interface Props {
  todo: Todo;
  meetingTitle: string | null;
}

export function TodoMeta({ todo, meetingTitle }: Props) {
  const timestamp = todo.meetingId ? quoteTimestamp(todo.details) : null;
  const shots = todo.screenshots.length;
  const isSelf = isSelfItem(todo);
  if (!isSelf && !todo.meetingId && shots === 0 && !todo.prompt) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-subtle">
      {isSelf && <CategoryLabel category={todo.category} className="opacity-90" />}
      {todo.meetingId && (
        <Link
          href={ownerMeetingRoute(todoOwner(todo), todo.meetingId)}
          title={meetingTitle ?? undefined}
          className="inline-flex items-center gap-1 rounded transition-colors hover:text-indigo"
        >
          <Video size={11} />
          From meeting{timestamp && <span className="font-mono tabular-nums">· {timestamp}</span>}
        </Link>
      )}
      {shots > 0 && (
        <span className="inline-flex items-center gap-1">
          <ImageIcon size={11} />
          {shots}
        </span>
      )}
      {todo.prompt && (
        <span className="inline-flex items-center gap-1 text-violet/80">
          <Sparkles size={11} />
          Prompt ready
        </span>
      )}
    </div>
  );
}
