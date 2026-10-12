'use client';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { useTodoForm } from '@/hooks/useTodoForm';
import { hasModifier } from '@/lib/keyboard';
import type { Todo } from '@/types';
import { BACKLOG_COPY, COMPOSER_COPY, DEFAULT_CATEGORY } from '@/constants/backlog';
import { CategorySelect } from './CategorySelect';
import { PrioritySelect } from './PrioritySelect';
import { StatusSelect } from './StatusSelect';

interface Props {
  todo: Todo;
  onClose: () => void;
}

const FORM_ID = 'todo-edit-form';

export function TodoEditModal({ todo, onClose }: Props) {
  const { values, setField, submit, canSubmit, isSaving, isSelf } = useTodoForm(todo, onClose);

  return (
    <Modal
      open
      size="lg"
      title={isSelf ? 'Edit backlog item' : 'Edit todo'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} disabled={!canSubmit}>
            {isSaving ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={submit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && hasModifier(event)) void submit(event);
        }}
        className="flex flex-col gap-4"
      >
        <Field label="Title" htmlFor="todo-title">
          <Input id="todo-title" autoFocus value={values.title} onChange={(event) => setField('title', event.target.value)} />
        </Field>
        <Field label="Details" htmlFor="todo-details" hint={isSelf ? COMPOSER_COPY.self.detailsPlaceholder : 'Raw meeting notes'}>
          <Textarea
            id="todo-details"
            rows={8}
            value={values.details}
            onChange={(event) => setField('details', event.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={isSelf ? COMPOSER_COPY.self.dateLabel : COMPOSER_COPY.client.dateLabel} htmlFor="todo-date">
            <Input
              id="todo-date"
              type="date"
              required
              value={values.meetingDate}
              onChange={(event) => setField('meetingDate', event.target.value)}
            />
          </Field>
          <Field label="Priority" htmlFor="todo-priority">
            <PrioritySelect value={values.priority} onChange={(priority) => setField('priority', priority)} className="flex h-10 items-stretch [&>button]:h-auto" />
          </Field>
        </div>
        {isSelf && (
          <Field label={BACKLOG_COPY.categoryField} htmlFor="todo-category">
            <CategorySelect
              value={values.category ?? DEFAULT_CATEGORY}
              onChange={(category) => setField('category', category)}
              className="flex [&>button]:flex-1"
            />
          </Field>
        )}
        <Field label="Status" htmlFor="todo-status">
          <StatusSelect value={values.status} onChange={(status) => setField('status', status)} />
        </Field>
      </form>
    </Modal>
  );
}
