import Link from 'next/link';
import { FolderX } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { COPY, ROUTES } from '@/constants/app';

export function ProjectNotFound() {
  return (
    <EmptyState
      className="py-20"
      icon={<FolderX size={22} />}
      title={COPY.projectNotFoundTitle}
      description={COPY.projectNotFoundDescription}
      action={
        <Link
          href={ROUTES.home}
          className="inline-flex h-9 items-center rounded-lg border border-line bg-elevated px-3.5 text-sm font-medium text-fg transition-colors hover:border-line-strong"
        >
          Back to projects
        </Link>
      }
    />
  );
}
