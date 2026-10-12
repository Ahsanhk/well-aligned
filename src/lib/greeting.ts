import { GREETING_COPY, TIME_OF_DAY_GREETINGS } from '@/constants/greeting';
import type { ProjectGroupSummary, ProjectSummary } from '@/types';

export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export function possessive(name: string) {
  return /s$/i.test(name) ? `${name}’` : `${name}’s`;
}

export function ownedLabel(name: string, suffix: string, fallback: string) {
  return name ? `${possessive(name)} ${suffix}` : fallback;
}

export function timeOfDayGreeting(date: Date) {
  const hour = date.getHours();
  return TIME_OF_DAY_GREETINGS.find((entry) => hour < entry.untilHour)?.text ?? TIME_OF_DAY_GREETINGS[0].text;
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export function workSummary(projects: ProjectSummary[], groups: ProjectGroupSummary[]) {
  const projectOpen = projects.reduce((total, project) => total + project.openCount, 0);
  const sharedOpen = groups.reduce((total, group) => total + group.sharedOpenCount, 0);
  const backlog =
    projects.reduce((total, project) => total + (project.backlogOpenCount ?? 0), 0) +
    groups.reduce((total, group) => total + group.sharedBacklogOpenCount, 0);
  const open = projectOpen + sharedOpen;
  const activeProjects = projects.filter((project) => project.openCount > 0).length;
  if (open === 0 && backlog === 0) return GREETING_COPY.caughtUp;
  const backlogPart = backlog > 0 ? `${backlog} in your backlog` : '';
  if (open === 0) return `no open client todos, ${backlogPart}.`;
  const openPart = `${plural(open, 'open todo')} across ${plural(Math.max(activeProjects, 1), 'project')}`;
  const sharedPart = sharedOpen > 0 ? ` (${sharedOpen} shared)` : '';
  return `${openPart}${sharedPart}${backlogPart ? `, ${backlogPart}` : ''}.`;
}

export function homeGreeting(name: string, date: Date, summary: string) {
  const salutation = name ? `${timeOfDayGreeting(date)}, ${name}` : timeOfDayGreeting(date);
  return `${salutation} — ${summary}`;
}
