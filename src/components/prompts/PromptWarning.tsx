import { TriangleAlert } from 'lucide-react';

export function PromptWarning({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-warning/25 bg-warning/5 px-3 py-2.5 text-[13px] leading-relaxed text-warning">
      <TriangleAlert size={15} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
