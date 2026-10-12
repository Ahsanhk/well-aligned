import { Skeleton } from '@/components/ui/Skeleton';

export function TodoListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="mb-1 h-4 w-40" />
      <div className="flex flex-col divide-y divide-line/60 overflow-hidden rounded-xl border border-line/80 bg-surface/60">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex items-center gap-3 px-3 py-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3.5 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
