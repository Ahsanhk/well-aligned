import { DEFAULT_PROJECT_TAB, PROJECT_TAB_PARAM, PROJECT_TABS } from '@/constants/meetings';
import type { ProjectTab } from '@/types';

export function parseProjectTab(query: Record<string, string | string[] | undefined>): ProjectTab {
  const value = query[PROJECT_TAB_PARAM];
  return PROJECT_TABS.find((tab) => tab.value === value)?.value ?? DEFAULT_PROJECT_TAB;
}

export function replaceTabInUrl(tab: ProjectTab) {
  const url = new URL(window.location.href);
  if (tab === DEFAULT_PROJECT_TAB) url.searchParams.delete(PROJECT_TAB_PARAM);
  else url.searchParams.set(PROJECT_TAB_PARAM, tab);
  url.hash = '';
  window.history.replaceState(window.history.state, '', url.toString());
}
