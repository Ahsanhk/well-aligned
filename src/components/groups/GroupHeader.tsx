'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectDot } from '@/components/projects/ProjectDot';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { IconButton } from '@/components/ui/IconButton';
import { Menu } from '@/components/ui/Menu';
import { MenuDivider } from '@/components/ui/MenuDivider';
import { MenuItem } from '@/components/ui/MenuItem';
import { ROUTES } from '@/constants/app';
import { GROUP_COPY } from '@/constants/groups';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useGroupsStore } from '@/store/groups';
import { useLayoutStore } from '@/store/layout';
import type { ProjectGroupSummary } from '@/types';

interface Props {
  group: ProjectGroupSummary;
  projectCount: number;
}

export function GroupHeader({ group, projectCount }: Props) {
  const router = useRouter();
  const openGroupForm = useLayoutStore((state) => state.openGroupForm);
  const remove = useGroupsStore((state) => state.remove);
  const confirm = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const ok = await remove(group.id);
    setIsDeleting(false);
    confirm.close();
    if (ok) router.push(ROUTES.home);
  };

  return (
    <>
      <PageHeader
        leading={<ProjectDot color={group.color} size="lg" />}
        title={group.name}
        description={group.description || undefined}
        meta={<Badge tone="indigo">{`${projectCount} project${projectCount === 1 ? '' : 's'}`}</Badge>}
        actions={
          <Menu
            trigger={({ isOpen, toggle }) => (
              <IconButton label="Group actions" onClick={toggle} aria-expanded={isOpen} className="border border-line">
                <Ellipsis size={16} />
              </IconButton>
            )}
          >
            {(close) => (
              <>
                <MenuItem
                  icon={<Pencil size={14} />}
                  label={GROUP_COPY.editGroup}
                  onSelect={() => {
                    close();
                    openGroupForm(group);
                  }}
                />
                <MenuDivider />
                <MenuItem
                  icon={<Trash2 size={14} />}
                  label="Delete group"
                  tone="danger"
                  onSelect={() => {
                    close();
                    confirm.open();
                  }}
                />
              </>
            )}
          </Menu>
        }
      />
      <ConfirmModal
        open={confirm.isOpen}
        title={GROUP_COPY.deleteTitle}
        message={GROUP_COPY.deleteMessage(group.name)}
        confirmLabel="Delete group"
        busy={isDeleting}
        onClose={confirm.close}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
