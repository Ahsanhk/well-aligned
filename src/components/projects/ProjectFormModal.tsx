'use client';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { useProjectForm } from '@/hooks/useProjectForm';
import type { Project } from '@/types';
import { ColorPicker } from './ColorPicker';
import { DetectedStackChip } from './DetectedStackChip';
import { GroupSelect } from './GroupSelect';
import { RepoPathField } from './RepoPathField';

interface Props {
  project: Project | null;
  onClose: () => void;
}

const FORM_ID = 'project-form';

export function ProjectFormModal({ project, onClose }: Props) {
  const form = useProjectForm(project, onClose);
  const { values, setField } = form;

  return (
    <Modal
      open
      title={form.isEditing ? 'Edit project' : 'New project'}
      description={form.isEditing ? undefined : 'One project per client codebase.'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} disabled={!form.canSubmit}>
            {form.isSaving ? 'Saving…' : form.isEditing ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={form.submit} className="flex flex-col gap-4">
        <Field label="Project name" htmlFor="project-name">
          <Input
            id="project-name"
            autoFocus
            required
            value={values.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder="Acme dashboard"
          />
        </Field>
        <RepoPathField value={values.repoPath} onChange={form.setRepoPath} onDetected={form.fillFromFolder} />
        <Field
          label="Tech stack"
          htmlFor="project-stack"
          hint="Optional"
          description={
            form.detectedStackOffer ? (
              <DetectedStackChip stack={form.detectedStackOffer} onUse={form.applyDetectedStack} />
            ) : undefined
          }
        >
          <Input
            id="project-stack"
            value={values.techStack}
            onChange={(event) => setField('techStack', event.target.value)}
            placeholder="Next.js, Tailwind, Supabase"
          />
        </Field>
        <GroupSelect value={values.groupId ?? null} onChange={(groupId) => setField('groupId', groupId)} />
        <Field label="Description" htmlFor="project-description" hint="Optional">
          <Textarea
            id="project-description"
            rows={2}
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
            placeholder="What is this project and who is the client?"
          />
        </Field>
        <Field label="Color" htmlFor="project-color">
          <ColorPicker value={values.color} onChange={(color) => setField('color', color)} />
        </Field>
      </form>
    </Modal>
  );
}
