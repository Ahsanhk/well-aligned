import { Skeleton } from '@/components/ui/Skeleton';

export function MeetingListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1].map((index) => (
        <Skeleton key={index} className="h-[74px] rounded-xl" />
      ))}
    </div>
  );
}
