'use client';

import { useCallback, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/app';
import { TOAST_COPY } from '@/constants/toast';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useProjectsStore } from '@/store/projects';
import { toastSuccess } from '@/store/toast';

export function useProjectDelete(projectId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const remove = useProjectsStore((state) => state.remove);
  const confirm = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteProject = useCallback(async () => {
    setIsDeleting(true);
    const ok = await remove(projectId);
    setIsDeleting(false);
    confirm.close();
    if (!ok) return;
    toastSuccess(TOAST_COPY.projectDeleted);
    if (pathname.startsWith(ROUTES.project(projectId))) router.push(ROUTES.home);
  }, [remove, projectId, confirm, pathname, router]);

  return { confirm, isDeleting, deleteProject };
}
