import { SavedPrompt } from '@/components/prompts/SavedPrompt';
import { ScreenshotManager } from '@/components/screenshots/ScreenshotManager';
import type { Todo } from '@/types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h4 className="text-[11px] font-medium tracking-wider text-subtle uppercase">{title}</h4>
      {children}
    </section>
  );
}

export function TodoExpanded({ todo }: { todo: Todo }) {
  return (
    <div className="animate-fade-in flex flex-col gap-4 px-3 pt-1 pb-4 pl-[3.25rem] sm:pl-[3.75rem]">
      <Section title="Details">
        {todo.details ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted">{todo.details}</p>
        ) : (
          <p className="text-sm text-subtle italic">No details</p>
        )}
      </Section>
      <Section title={`Screenshots · ${todo.screenshots.length}`}>
        <ScreenshotManager todo={todo} />
      </Section>
      {todo.prompt && (
        <Section title="Saved prompt">
          <SavedPrompt todoId={todo.id} prompt={todo.prompt} />
        </Section>
      )}
    </div>
  );
}
