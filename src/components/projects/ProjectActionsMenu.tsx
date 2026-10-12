'use client';

import { Download, Ellipsis, FolderInput, Pencil, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { IconButton } from '@/components/ui/IconButton';
import { Menu } from '@/components/ui/Menu';
import { MenuDivider } from '@/components/ui/MenuDivider';
import { MenuItem } from '@/components/ui/MenuItem';
import { MenuLabel } from '@/components/ui/MenuLabel';
import { GROUP_COPY } from '@/constants/groups';
import { useProjectDelete } from '@/hooks/useProjectDelete';
import { exportUrl } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { downloadFromUrl } from '@/lib/download';
import { useGroupsStore } from '@/store/groups';
import { useLayoutStore } from '@/store/layout';
import { useProjectsStore } from '@/store/projects';
import type { Project } from '@/types';

interface Props {
  project: Project;
  showEdit?: boolean;
  portal?: boolean;
  triggerClassName?: string;
  size?: 'sm' | 'md';
}

export function ProjectActionsMenu({ project, showEdit = true, portal = false, triggerClassName, size = 'sm' }: Props) {
  const groups = useGroupsStore((state) => state.groups);
  const openProjectForm = useLayoutStore((state) => state.openProjectForm);
  const update = useProjectsStore((state) => state.update);
  const { confirm, isDeleting, deleteProject } = useProjectDelete(project.id);
  const moveTargets = [
    ...groups.filter((group) => group.id !== project.groupId).map((group) => ({ id: group.id as string | null, label: group.name })),
    ...(project.groupId ? [{ id: null, label: GROUP_COPY.noGroup }] : []),
  ];

  return (
    <>
      <Menu
        portal={portal}
        trigger={({ isOpen, toggle }) => (
          <IconButton
            label="Project actions"
            size={size}
            aria-expanded={isOpen}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggle();
            }}
            className={cn(isOpen && 'bg-elevated text-fg', triggerClassName)}
          >
            <Ellipsis size={16} />
          </IconButton>
        )}
      >
        {(close) => {
          const select = (action: () => void) => () => {
            close();
            action();
          };
          return (
            <>
              {showEdit && <MenuItem icon={<Pencil size={14} />} label="Edit" onSelect={select(() => openProjectForm(project))} />}
              <MenuItem
                icon={<Download size={14} />}
                label="Export JSON"
                onSelect={select(() => downloadFromUrl(exportUrl(project.id)))}
              />
              {moveTargets.length > 0 && (
                <>
                  <MenuDivider />
                  <MenuLabel>{GROUP_COPY.moveToGroup}</MenuLabel>
                  {moveTargets.map((target) => (
                    <MenuItem
                      key={target.id ?? 'none'}
                      icon={<FolderInput size={14} />}
                      label={target.label}
                      onSelect={select(() => void update(project.id, { groupId: target.id }))}
                    />
                  ))}
                </>
              )}
              <MenuDivider />
              <MenuItem icon={<Trash2 size={14} />} label="Delete project" tone="danger" onSelect={select(confirm.open)} />
            </>
          );
        }}
      </Menu>
      <ConfirmModal
        open={confirm.isOpen}
        title="Delete project?"
        message={`“${project.name}” and all of its todos and screenshots will be permanently deleted. Export it first if you want a backup.`}
        confirmLabel="Delete project"
        busy={isDeleting}
        onClose={confirm.close}
        onConfirm={() => void deleteProject()}
      />
    </>
  );
}
