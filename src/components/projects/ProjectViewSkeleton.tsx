import { TodoListSkeleton } from '@/components/todos/TodoListSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProjectViewSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-40 rounded-xl" />
      <TodoListSkeleton />
    </div>
  );
}
