import { PROJECT_COLOR_CLASSES } from '@/constants/project-colors';
import { cn } from '@/lib/cn';
import type { ProjectColor } from '@/types';

interface Props {
  color: ProjectColor;
  size?: 'sm' | 'lg';
}

export function ProjectDot({ color, size = 'sm' }: Props) {
  const colors = PROJECT_COLOR_CLASSES[color];
  if (size === 'sm') return <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', colors.dot, colors.glow)} />;
  return (
    <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line', colors.soft)}>
      <span className={cn('h-3 w-3 rounded-full', colors.dot, colors.glow)} />
    </span>
  );
}
