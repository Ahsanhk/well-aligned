'use client';

import { useLayoutStore } from '@/store/layout';
import { GroupFormModal } from './GroupFormModal';

export function GroupFormHost() {
  const { isOpen, group } = useLayoutStore((state) => state.groupForm);
  const closeGroupForm = useLayoutStore((state) => state.closeGroupForm);
  if (!isOpen) return null;
  return <GroupFormModal key={group?.id ?? 'new'} group={group} onClose={closeGroupForm} />;
}
