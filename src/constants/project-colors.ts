import type { ProjectColor } from '@/types';

interface ProjectColorClasses {
  dot: string;
  soft: string;
  text: string;
  ring: string;
  glow: string;
}

export const PROJECT_COLOR_OPTIONS: { value: ProjectColor; label: string }[] = [
  { value: 'cyan', label: 'Cyan' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'violet', label: 'Violet' },
  { value: 'teal', label: 'Teal' },
  { value: 'sky', label: 'Sky' },
  { value: 'rose', label: 'Rose' },
];

export const PROJECT_COLOR_CLASSES: Record<ProjectColor, ProjectColorClasses> = {
  cyan: {
    dot: 'bg-cyan',
    soft: 'bg-cyan/10',
    text: 'text-cyan',
    ring: 'ring-cyan/50',
    glow: 'shadow-[0_0_12px_-2px_var(--color-cyan)]',
  },
  indigo: {
    dot: 'bg-indigo',
    soft: 'bg-indigo/10',
    text: 'text-indigo',
    ring: 'ring-indigo/50',
    glow: 'shadow-[0_0_12px_-2px_var(--color-indigo)]',
  },
  violet: {
    dot: 'bg-violet',
    soft: 'bg-violet/10',
    text: 'text-violet',
    ring: 'ring-violet/50',
    glow: 'shadow-[0_0_12px_-2px_var(--color-violet)]',
  },
  teal: {
    dot: 'bg-teal',
    soft: 'bg-teal/10',
    text: 'text-teal',
    ring: 'ring-teal/50',
    glow: 'shadow-[0_0_12px_-2px_var(--color-teal)]',
  },
  sky: {
    dot: 'bg-sky',
    soft: 'bg-sky/10',
    text: 'text-sky',
    ring: 'ring-sky/50',
    glow: 'shadow-[0_0_12px_-2px_var(--color-sky)]',
  },
  rose: {
    dot: 'bg-rose',
    soft: 'bg-rose/10',
    text: 'text-rose',
    ring: 'ring-rose/50',
    glow: 'shadow-[0_0_12px_-2px_var(--color-rose)]',
  },
};

export const DEFAULT_PROJECT_COLOR: ProjectColor = 'cyan';
