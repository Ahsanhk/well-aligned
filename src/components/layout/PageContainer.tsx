import type { ReactNode } from 'react';
import { PAGE_CONTAINER_CLASS, PAGE_VERTICAL_CLASS } from '@/constants/layout';
import { cn } from '@/lib/cn';

interface Props {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: Props) {
  return <main className={cn(PAGE_CONTAINER_CLASS, PAGE_VERTICAL_CLASS, className)}>{children}</main>;
}
