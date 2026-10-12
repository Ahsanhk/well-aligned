export const GREETING_COPY = {
  projectsFallback: 'Your projects',
  workspaceFallback: 'Your workspace',
  projectsSuffix: 'projects',
  workspaceSuffix: 'workspace',
  neutralSubtitle: 'Pick a project to capture todos from today’s client meeting.',
  caughtUp: 'nothing open, you’re all caught up.',
} as const;

export const TIME_OF_DAY_GREETINGS: { untilHour: number; text: string }[] = [
  { untilHour: 5, text: 'Working late' },
  { untilHour: 12, text: 'Good morning' },
  { untilHour: 17, text: 'Good afternoon' },
  { untilHour: 24, text: 'Good evening' },
];
