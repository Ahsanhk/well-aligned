import 'server-only';
import type { ProjectInsert, ScreenshotInsert, TodoInsert } from '@/types';
import { findOwnedStoragePaths, type DbClient } from './db';
import { newId, nowIso } from './ids';
import { projectOwner } from './owner';
import type { ProjectExportInput } from './schemas';
import { copyScreenshotObject, isScreenshotMimeType, removeScreenshotObjects, screenshotStoragePath } from './uploads';

type ImportedScreenshot = ProjectExportInput['todos'][number]['screenshots'][number];

export interface ImportedProjectRows {
  project: ProjectInsert & { id: string };
  todos: TodoInsert[];
  screenshots: ScreenshotInsert[];
}

async function copyScreenshot(
  shot: ImportedScreenshot,
  userId: string,
  projectId: string,
  todoId: string,
  now: string,
): Promise<ScreenshotInsert | null> {
  if (!isScreenshotMimeType(shot.mimeType)) return null;
  const id = newId();
  const storagePath = screenshotStoragePath(userId, projectOwner(projectId), todoId, id, shot.mimeType);
  if (!(await copyScreenshotObject(shot.fileName, storagePath))) return null;
  return {
    id,
    todo_id: todoId,
    storage_path: storagePath,
    original_name: shot.originalName,
    mime_type: shot.mimeType,
    size: shot.size,
    created_at: shot.createdAt ?? now,
  };
}

export async function buildImportedProjectRows(client: DbClient, userId: string, data: ProjectExportInput): Promise<ImportedProjectRows> {
  const now = nowIso();
  const ownedPaths = await findOwnedStoragePaths(
    client,
    data.todos.flatMap((todo) => todo.screenshots.map((shot) => shot.fileName)),
  );
  const projectId = newId();
  const todos: TodoInsert[] = [];
  const copies: Promise<ScreenshotInsert | null>[] = [];
  for (const todo of data.todos) {
    const todoId = newId();
    todos.push({
      id: todoId,
      project_id: projectId,
      title: todo.title,
      details: todo.details,
      meeting_date: todo.meetingDate,
      status: todo.status,
      priority: todo.priority,
      origin: todo.origin,
      category: todo.origin === 'self' ? todo.category : null,
      prompt: todo.prompt,
      created_at: todo.createdAt ?? now,
      completed_at: todo.status === 'done' ? (todo.completedAt ?? now) : null,
    });
    copies.push(
      ...todo.screenshots
        .filter((shot) => ownedPaths.has(shot.fileName))
        .map((shot) => copyScreenshot(shot, userId, projectId, todoId, now)),
    );
  }
  const screenshots = (await Promise.all(copies)).filter((shot): shot is ScreenshotInsert => shot !== null);
  return {
    project: {
      id: projectId,
      user_id: userId,
      name: data.project.name,
      description: data.project.description,
      repo_path: data.project.repoPath,
      tech_stack: data.project.techStack,
      color: data.project.color,
    },
    todos,
    screenshots,
  };
}

export async function discardImportedScreenshots(rows: ImportedProjectRows): Promise<void> {
  await removeScreenshotObjects(rows.screenshots.map((shot) => shot.storage_path));
}
