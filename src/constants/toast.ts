export const TOAST_DURATION_MS = 4000;

export const TOAST_LIMIT = 3;

export const TOAST_COPY = {
  projectCreated: 'Project created',
  projectUpdated: 'Project updated',
  projectDeleted: 'Project deleted',
  projectImported: 'Project imported',
  importInvalid: 'That file is not a valid project export',
  todoCreated: 'Todo added',
  todoDeleted: 'Todo deleted',
  todoUpdated: 'Todo updated',
  screenshotsAdded: 'Screenshots attached',
  screenshotRemoved: 'Screenshot removed',
  screenshotTooLarge: 'Some images were skipped (max 8 MB each)',
  uploadFailed: 'Todo saved, but screenshots failed to upload',
  promptGenerated: 'Prompt ready',
  copied: 'Copied to clipboard',
  copyFailed: 'Could not copy to clipboard',
  genericError: 'Something went wrong',
} as const;

export const BULK_TOAST_COPY = {
  todosDeleted: (count: number) => `Deleted ${count} todo${count === 1 ? '' : 's'}`,
  todoMoved: 'Todo moved',
  groupCreated: 'Group created',
  groupUpdated: 'Group updated',
  groupDeleted: 'Group deleted',
} as const;
