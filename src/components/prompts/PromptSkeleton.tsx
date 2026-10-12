import { Skeleton } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';

const LINE_WIDTHS = ['w-3/4', 'w-full', 'w-5/6', 'w-2/3', 'w-full', 'w-1/2', 'w-4/5', 'w-3/5'];

export function PromptSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Spinner className="text-accent" />
        Writing your prompt…
      </div>
      <div className="flex flex-col gap-2.5 rounded-lg border border-line bg-sunken p-4">
        {LINE_WIDTHS.map((width, index) => (
          <Skeleton key={index} className={`h-3 ${width}`} />
        ))}
      </div>
    </div>
  );
}
