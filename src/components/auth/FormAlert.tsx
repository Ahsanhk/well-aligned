import { CircleAlert } from 'lucide-react';

export function FormAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="animate-fade-in flex items-start gap-2 rounded-lg border border-danger/25 bg-danger/10 px-3 py-2.5 text-sm text-danger">
      <CircleAlert size={15} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
