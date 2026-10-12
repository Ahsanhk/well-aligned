import { z } from 'zod';
import { API_ERRORS } from '@/constants/api-errors';
import { API_TOKEN_NAME_MAX_LENGTH, RUN_MAX_TODOS, RUN_PROMPT_MAX_LENGTH } from '@/constants/claude-link';
import { MEETING_TITLE_MAX_LENGTH, TRANSCRIPT_FORMAT_VALUES } from '@/constants/meeting';
import { EXTRA_INSTRUCTIONS_MAX_LENGTH, MAX_TODOS_PER_PROMPT } from '@/constants/prompt';
import {
  DEFAULT_PROJECT_COLOR,
  DEFAULT_TODO_ORIGIN,
  DEFAULT_TODO_PRIORITY,
  DEFAULT_TODO_STATUS,
  EXPORT_VERSION,
  FIELD_LIMITS,
  PROJECT_COLORS,
  TODO_CATEGORIES,
  TODO_ORIGINS,
  TODO_PRIORITIES,
  TODO_STATUSES,
} from '@/constants/storage';

const projectName = z.string().trim().min(1, 'Name is required').max(FIELD_LIMITS.projectName);
const projectDescription = z.string().trim().max(FIELD_LIMITS.projectDescription);
const repoPath = z.string().trim().max(FIELD_LIMITS.repoPath);
const techStack = z.string().trim().max(FIELD_LIMITS.techStack);
const projectColor = z.enum(PROJECT_COLORS);

const todoTitle = z.string().trim().min(1, 'Title is required').max(FIELD_LIMITS.todoTitle);
const todoDetails = z.string().trim().max(FIELD_LIMITS.todoDetails);
const meetingDate = z.iso.date('Use a YYYY-MM-DD date');
const todoPriority = z.enum(TODO_PRIORITIES);
const todoStatus = z.enum(TODO_STATUSES);

export const projectInputSchema = z.object({
  name: projectName,
  description: projectDescription.default(''),
  repoPath: repoPath.default(''),
  techStack: techStack.default(''),
  color: projectColor.default(DEFAULT_PROJECT_COLOR),
  groupId: z.string().trim().min(1).nullable().optional(),
});

export const projectPatchSchema = z.object({
  name: projectName.optional(),
  description: projectDescription.optional(),
  repoPath: repoPath.optional(),
  techStack: techStack.optional(),
  color: projectColor.optional(),
  groupId: z.string().trim().min(1).nullable().optional(),
});

export const projectGroupInputSchema = z.object({
  name: projectName,
  description: projectDescription.default(''),
  color: projectColor.default(DEFAULT_PROJECT_COLOR),
});

export const projectGroupPatchSchema = z.object({
  name: projectName.optional(),
  description: projectDescription.optional(),
  color: projectColor.optional(),
});

export const todoMoveSchema = z.union(
  [z.object({ projectId: z.string().trim().min(1) }).strict(), z.object({ groupId: z.string().trim().min(1) }).strict()],
  API_ERRORS.invalidMoveTarget,
);

export const todoOriginSchema = z.enum(TODO_ORIGINS);

const todoCategory = z.enum(TODO_CATEGORIES);

export const todoInputSchema = z
  .object({
    title: todoTitle,
    details: todoDetails.default(''),
    meetingDate,
    priority: todoPriority.default(DEFAULT_TODO_PRIORITY),
    origin: todoOriginSchema.default(DEFAULT_TODO_ORIGIN),
    category: todoCategory.nullable().optional(),
  })
  .superRefine((input, context) => {
    if (input.origin === 'self' && !input.category) {
      context.addIssue({ code: 'custom', path: ['category'], message: API_ERRORS.categoryRequired });
    }
    if (input.origin === 'client' && input.category) {
      context.addIssue({ code: 'custom', path: ['category'], message: API_ERRORS.categoryNotAllowed });
    }
  });

export const todoPatchSchema = z.object({
  title: todoTitle.optional(),
  details: todoDetails.optional(),
  meetingDate: meetingDate.optional(),
  priority: todoPriority.optional(),
  status: todoStatus.optional(),
  category: todoCategory.optional(),
});

export const promptRequestSchema = z.object({
  projectId: z.string().trim().min(1),
  todoIds: z
    .array(z.string().trim().min(1))
    .min(1, 'Select at least one todo')
    .max(MAX_TODOS_PER_PROMPT)
    .transform((ids) => [...new Set(ids)]),
  extraInstructions: z.string().trim().max(EXTRA_INSTRUCTIONS_MAX_LENGTH).default(''),
});

const isoTimestamp = z.iso.datetime({ offset: true });

const importedScreenshotSchema = z.object({
  fileName: z.string().max(200),
  originalName: z.string().max(FIELD_LIMITS.originalName).catch('screenshot'),
  mimeType: z.string().max(100),
  size: z.number().int().nonnegative().catch(0),
  createdAt: isoTimestamp.optional().catch(undefined),
});

const importedPromptSchema = z.object({
  text: z.string().max(FIELD_LIMITS.promptText),
  source: z.enum(['ai', 'template']),
  model: z.string().max(FIELD_LIMITS.modelName).nullable(),
  generatedAt: isoTimestamp,
});

const importedTodoSchema = z.object({
  title: todoTitle,
  details: todoDetails.catch(''),
  meetingDate,
  status: todoStatus.catch(DEFAULT_TODO_STATUS),
  priority: todoPriority.catch(DEFAULT_TODO_PRIORITY),
  origin: todoOriginSchema.catch(DEFAULT_TODO_ORIGIN),
  category: todoCategory.nullable().catch(null),
  screenshots: z.array(importedScreenshotSchema).catch([]),
  prompt: importedPromptSchema.nullable().catch(null),
  createdAt: isoTimestamp.optional().catch(undefined),
  updatedAt: isoTimestamp.optional().catch(undefined),
  completedAt: isoTimestamp.nullable().catch(null),
});

export const projectExportSchema = z.object({
  version: z.literal(EXPORT_VERSION),
  exportedAt: isoTimestamp.optional().catch(undefined),
  project: z.object({
    name: projectName,
    description: projectDescription.catch(''),
    repoPath: repoPath.catch(''),
    techStack: techStack.catch(''),
    color: projectColor.catch(DEFAULT_PROJECT_COLOR),
    createdAt: isoTimestamp.optional().catch(undefined),
  }),
  todos: z.array(importedTodoSchema),
});

export type ProjectExportInput = z.infer<typeof projectExportSchema>;

export const geminiPromptOutputSchema = z.object({
  prompt: z.string().trim().min(1).describe('The complete markdown prompt for Claude Code'),
});

export function geminiPromptResponseJsonSchema() {
  const { $schema: _unsupported, ...schema } = z.toJSONSchema(geminiPromptOutputSchema);
  return schema;
}

const meetingTitle = z.string().trim().min(1, 'Title is required').max(MEETING_TITLE_MAX_LENGTH);

export const meetingUploadQuerySchema = z.object({
  meetingDate,
  title: z.string().trim().max(MEETING_TITLE_MAX_LENGTH).optional().catch(undefined),
});

export const meetingPatchSchema = z.object({
  title: meetingTitle.optional(),
  meetingDate: meetingDate.optional(),
});

export const acceptSuggestionsSchema = z.object({
  suggestions: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        title: todoTitle,
        details: todoDetails.default(''),
        priority: todoPriority,
        frameIds: z.array(z.string().trim().min(1)).optional(),
        targetProjectId: z.string().trim().min(1).nullable().optional(),
      }),
    )
    .min(1, 'Select at least one suggestion')
    .refine((items) => new Set(items.map((item) => item.id)).size === items.length, 'Suggestions must be unique'),
});

export const dismissSuggestionsSchema = z.object({
  suggestionIds: z
    .array(z.string().trim().min(1))
    .min(1, 'Select at least one suggestion')
    .transform((ids) => [...new Set(ids)]),
});

export const transcriptFormatSchema = z.enum(TRANSCRIPT_FORMAT_VALUES).catch('md');

export const meetingAnalysisSchema = z.object({
  title: z.string().trim().describe('Short specific meeting title, at most 8 words'),
  summary: z.string().trim().describe('3 to 6 short sentences, one per line, each starting with "- "'),
  transcript: z
    .array(
      z.object({
        start: z.string().describe('Segment start time, mm:ss or h:mm:ss'),
        speaker: z.string().describe('Speaker name, or Client / Developer'),
        text: z.string().describe('What was said, verbatim, in the spoken language'),
      }),
    )
    .describe('Chronological transcript segments'),
  suggestions: z
    .array(
      z.object({
        title: z.string().trim().describe('Imperative task title, at most 12 words'),
        details: z.string().trim().describe('Standalone task description with every concrete specific'),
        priority: z.enum(TODO_PRIORITIES),
        timestamp: z.string().describe('Start time of the supporting quote, mm:ss or h:mm:ss'),
        quote: z.string().trim().describe('Exact supporting words from the transcript'),
        frameTimestamps: z
          .array(z.string())
          .describe('0 to 3 times (mm:ss or h:mm:ss) where the screen best shows what this task is about; empty when nothing relevant is visible'),
        suggestedProject: z
          .string()
          .describe('For group meetings: the exact name of the one listed project this task belongs to, or "shared". Empty string when no group projects are listed'),
      }),
    )
    .describe('Only concrete action items for the developer'),
});

export type MeetingAnalysisOutput = z.infer<typeof meetingAnalysisSchema>;

export function meetingAnalysisResponseJsonSchema() {
  const { $schema: _unsupported, ...schema } = z.toJSONSchema(meetingAnalysisSchema);
  return schema;
}

export const apiTokenInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(API_TOKEN_NAME_MAX_LENGTH),
});

export const startRunSchema = z.object({
  projectId: z.string().trim().min(1),
  todoIds: z
    .array(z.string().trim().min(1))
    .min(1, 'Select at least one todo')
    .max(RUN_MAX_TODOS)
    .refine((ids) => new Set(ids).size === ids.length, 'Todos must be unique'),
  mode: z.enum(['terminal', 'queue']),
  prompt: z.string().trim().min(1, 'Prompt is required').max(RUN_PROMPT_MAX_LENGTH),
});

export const completeRunSchema = z.object({
  summary: z.string().trim().max(20000).optional(),
});

export const terminalTicketSchema = z.object({
  runId: z.string().trim().min(1),
});
