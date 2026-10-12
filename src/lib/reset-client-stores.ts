import { useGroupsStore } from '@/store/groups';
import { useLayoutStore } from '@/store/layout';
import { useMeetingsStore } from '@/store/meetings';
import { useProjectsStore } from '@/store/projects';
import { usePromptPanelStore } from '@/store/prompt-panel';
import { useSelectionStore } from '@/store/selection';
import { useTodosStore } from '@/store/todos';
import { useToastStore } from '@/store/toast';

export function resetClientStores() {
  [useProjectsStore, useGroupsStore, useTodosStore, useMeetingsStore, useSelectionStore, usePromptPanelStore, useLayoutStore, useToastStore].forEach(
    (store) => store.getState().reset(),
  );
}
