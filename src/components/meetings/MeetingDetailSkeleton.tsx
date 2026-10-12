import { Skeleton } from '@/components/ui/Skeleton';

export function MeetingDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-80 max-w-full" />
      <Skeleton className="h-28 rounded-xl" />
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}
