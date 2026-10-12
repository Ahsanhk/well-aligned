import { Skeleton } from '@/components/ui/Skeleton';
import { PROJECT_GRID_CLASS } from '@/constants/layout';

export function ProjectGridSkeleton() {
  return (
    <div className={PROJECT_GRID_CLASS}>
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}
