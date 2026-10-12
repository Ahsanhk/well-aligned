'use client';

import { ColorPicker } from '@/components/projects/ColorPicker';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { GROUP_COPY } from '@/constants/groups';
import { useGroupForm } from '@/hooks/useGroupForm';
import type { ProjectGroup } from '@/types';

interface Props {
  group: ProjectGroup | null;
  onClose: () => void;
}

const FORM_ID = 'group-form';

export function GroupFormModal({ group, onClose }: Props) {
  const form = useGroupForm(group, onClose);
  return (
    <Modal
      open
      title={form.isEditing ? GROUP_COPY.editGroup : GROUP_COPY.newGroup}
      description={form.isEditing ? undefined : GROUP_COPY.groupDescription}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} disabled={!form.canSubmit}>
            {form.isSaving ? 'Saving…' : form.isEditing ? 'Save changes' : 'Create group'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={form.submit} className="flex flex-col gap-4">
        <Field label="Group name" htmlFor="group-name">
          <Input
            id="group-name"
            autoFocus
            required
            value={form.values.name}
            onChange={(event) => form.setField('name', event.target.value)}
            placeholder={GROUP_COPY.groupNamePlaceholder}
          />
        </Field>
        <Field label="Description" htmlFor="group-description" hint="Optional">
          <Textarea
            id="group-description"
            rows={2}
            value={form.values.description}
            onChange={(event) => form.setField('description', event.target.value)}
          />
        </Field>
        <Field label="Color" htmlFor="group-color">
          <ColorPicker value={form.values.color} onChange={(color) => form.setField('color', color)} />
        </Field>
      </form>
    </Modal>
  );
}
