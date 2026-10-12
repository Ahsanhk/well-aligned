import { CopyButton } from '@/components/ui/CopyButton';
import { JSON_INDENT } from '@/constants/app';
import { formatJson } from '@/lib/json';
import type { Todo } from '@/types';

export function TodosJsonView({ todos }: { todos: Todo[] }) {
  const json = formatJson(todos, JSON_INDENT);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {todos.length} todo{todos.length === 1 ? '' : 's'} as raw JSON
        </p>
        <CopyButton text={json} label="Copy JSON" />
      </div>
      <pre className="max-h-[55dvh] overflow-auto rounded-lg border border-line bg-sunken p-4 font-mono text-[12px] leading-relaxed text-muted">
        {json}
      </pre>
    </div>
  );
}
