import 'server-only';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { MCP_MESSAGES, MCP_SERVER_NAME, MCP_SERVER_VERSION, MCP_TOOL_DESCRIPTIONS } from '@/constants/claude-link';
import { TODO_ORIGINS, TODO_STATUSES } from '@/constants/storage';
import type { Project, RunRow, Todo } from '@/types';
import { finishedRunFields, isRunComplete, notifyRunFinished, withTodoProgress } from './runs';
import {
  projectForCwd,
  scopedActiveRuns,
  scopedActiveRunsWithTodo,
  scopedGroupName,
  scopedMeeting,
  scopedProject,
  scopedProjectTodos,
  scopedTodo,
  setScopedTodoStatus,
  updateScopedRun,
} from './token-scope';
import { materializeScreenshot } from './uploads';

const QUOTE_LINE = /^>\s*Client said \(([^)]*)\):\s*"(.*)"\s*$/m;

function text(value: string) {
  return { content: [{ type: 'text' as const, text: value }] };
}

function todoLabel(todo: Todo): string {
  const parts = [todo.status, todo.priority, todo.origin === 'self' ? `self/${todo.category ?? 'issue'}` : 'client'];
  if (todo.groupId) parts.push('shared');
  return parts.join(' · ');
}

async function screenshotPaths(todo: Todo): Promise<string[]> {
  const paths = await Promise.all(todo.screenshots.map((shot) => materializeScreenshot(shot).catch(() => null)));
  return paths.filter((value): value is string => Boolean(value));
}

async function formatTodo(todo: Todo, heading: string): Promise<string> {
  const lines = [heading, `id: ${todo.id} | ${todoLabel(todo)}`];
  const details = todo.details.replace(QUOTE_LINE, '').trim();
  if (details) lines.push(details);
  const quote = QUOTE_LINE.exec(todo.details);
  if (quote) lines.push(`Meeting quote (${quote[1]}): "${quote[2]}"`);
  const shots = await screenshotPaths(todo);
  if (shots.length) lines.push('Screenshots:', ...shots.map((shot) => `- ${shot}`));
  return lines.join('\n');
}

function compactLine(todo: Todo): string {
  return `- ${todo.title} (${todoLabel(todo)}) id: ${todo.id}`;
}

async function describeProject(userId: string, project: Project): Promise<string> {
  const group = await scopedGroupName(userId, project.groupId);
  return [`Project: ${project.name}`, `id: ${project.id}`, `repo: ${project.repoPath}`, ...(group ? [`group: ${group}`] : [])].join('\n');
}

async function queuedTasks(userId: string, cwd: string): Promise<string> {
  const project = await projectForCwd(userId, cwd);
  if (!project) return MCP_MESSAGES.noProject;
  const runs = await scopedActiveRuns(userId, project.id);
  const todoIds = [...new Set(runs.flatMap((run) => run.todo_ids))];
  const todos = (await Promise.all(todoIds.map((id) => scopedTodo(userId, id)))).filter(
    (todo): todo is Todo => todo !== null && todo.status !== 'done',
  );
  if (!todos.length) return MCP_MESSAGES.noQueued;
  await Promise.all(runs.filter((run) => run.status === 'queued').map((run) => updateScopedRun(userId, run.id, { status: 'working' })));
  const sections = await Promise.all(todos.map((todo, index) => formatTodo(todo, `## ${index + 1}. ${todo.title} (todo: ${todo.id})`)));
  return [await describeProject(userId, project), ...sections, 'Call complete_todo with the todo id and a one-line note after each task.'].join('\n\n');
}

async function finishRunIfComplete(userId: string, run: RunRow, progress: RunRow['progress']): Promise<boolean> {
  if (!isRunComplete(progress)) {
    await updateScopedRun(userId, run.id, { progress, status: 'working' });
    return false;
  }
  const project = await scopedProject(userId, run.project_id);
  await updateScopedRun(userId, run.id, await finishedRunFields(progress, project, null));
  const todos = (await Promise.all(run.todo_ids.map((id) => scopedTodo(userId, id)))).filter((todo): todo is Todo => todo !== null);
  await notifyRunFinished(todos, project);
  return true;
}

async function startTodo(userId: string, todoId: string): Promise<string> {
  const todo = await setScopedTodoStatus(userId, todoId, 'in_progress');
  if (!todo) return MCP_MESSAGES.todoNotFound;
  const runs = await scopedActiveRunsWithTodo(userId, todo.id);
  await Promise.all(
    runs.map((run) => updateScopedRun(userId, run.id, { status: 'working', progress: withTodoProgress(run.progress, todo.id, 'working', null) })),
  );
  return MCP_MESSAGES.started(todo.title);
}

async function completeTodo(userId: string, todoId: string, note: string): Promise<string> {
  const todo = await setScopedTodoStatus(userId, todoId, 'done');
  if (!todo) return MCP_MESSAGES.todoNotFound;
  const runs = await scopedActiveRunsWithTodo(userId, todo.id);
  const lines = [MCP_MESSAGES.completed(todo.title)];
  for (const run of runs) {
    const progress = withTodoProgress(run.progress, todo.id, 'done', note.trim() || null);
    if (await finishRunIfComplete(userId, run, progress)) lines.push(MCP_MESSAGES.runFinished(run.todo_ids.length));
  }
  return lines.join('\n');
}

export function buildMcpServer(userId: string): McpServer {
  const server = new McpServer({ name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION });
  const cwd = z.string().min(1).max(1000).describe('Absolute path of the current working directory');
  const id = z.string().min(1).max(100);

  server.registerTool('current_project', { description: MCP_TOOL_DESCRIPTIONS.currentProject, inputSchema: { cwd } }, async (args) => {
    const project = await projectForCwd(userId, args.cwd);
    return text(project ? await describeProject(userId, project) : MCP_MESSAGES.noProject);
  });

  server.registerTool('queued_tasks', { description: MCP_TOOL_DESCRIPTIONS.queuedTasks, inputSchema: { cwd } }, async (args) =>
    text(await queuedTasks(userId, args.cwd)),
  );

  server.registerTool(
    'list_todos',
    {
      description: MCP_TOOL_DESCRIPTIONS.listTodos,
      inputSchema: {
        projectId: id,
        status: z.enum([...TODO_STATUSES, 'all']).optional(),
        origin: z.enum([...TODO_ORIGINS, 'all']).optional(),
        includeShared: z.boolean().optional(),
      },
    },
    async (args) => {
      const todos = await scopedProjectTodos(userId, args.projectId, {
        status: args.status ?? 'open',
        origin: args.origin ?? 'all',
        includeShared: args.includeShared ?? true,
      });
      if (!todos) return text(MCP_MESSAGES.projectNotFound);
      return text(todos.length ? todos.map(compactLine).join('\n') : MCP_MESSAGES.noTodos);
    },
  );

  server.registerTool('get_todo', { description: MCP_TOOL_DESCRIPTIONS.getTodo, inputSchema: { todoId: id } }, async (args) => {
    const todo = await scopedTodo(userId, args.todoId);
    return text(todo ? await formatTodo(todo, `## ${todo.title}`) : MCP_MESSAGES.todoNotFound);
  });

  server.registerTool('start_todo', { description: MCP_TOOL_DESCRIPTIONS.startTodo, inputSchema: { todoId: id } }, async (args) =>
    text(await startTodo(userId, args.todoId)),
  );

  server.registerTool(
    'complete_todo',
    { description: MCP_TOOL_DESCRIPTIONS.completeTodo, inputSchema: { todoId: id, note: z.string().max(2000) } },
    async (args) => text(await completeTodo(userId, args.todoId, args.note)),
  );

  server.registerTool('get_meeting', { description: MCP_TOOL_DESCRIPTIONS.getMeeting, inputSchema: { meetingId: id } }, async (args) => {
    const meeting = await scopedMeeting(userId, args.meetingId);
    if (!meeting) return text(MCP_MESSAGES.meetingNotFound);
    const transcript = meeting.transcript.map((segment) => `[${segment.start}] ${segment.speaker}: ${segment.text}`).join('\n');
    return text([`# ${meeting.title} (${meeting.meetingDate})`, meeting.summary, transcript].filter(Boolean).join('\n\n'));
  });

  return server;
}
