import type { MeetingStatus, SuggestedTodo, TranscriptSegment } from './meeting';
import type { ProjectColor } from './project';
import type { RunFileChange, RunMode, RunStatus, RunTodoProgress } from './run';
import type { GeneratedPrompt } from './prompt';
import type { TodoCategory, TodoOrigin, TodoPriority, TodoStatus } from './todo';

export type ProjectRow = {
  id: string;
  user_id: string | null;
  name: string;
  description: string;
  repo_path: string;
  tech_stack: string;
  color: ProjectColor;
  group_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectGroupRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: ProjectColor;
  created_at: string;
  updated_at: string;
};

export type ProjectGroupInsert = Pick<ProjectGroupRow, 'user_id' | 'name' | 'description' | 'color'> & Partial<Pick<ProjectGroupRow, 'id' | 'created_at' | 'updated_at'>>;

export type TodoRow = {
  id: string;
  project_id: string | null;
  group_id: string | null;
  title: string;
  details: string;
  meeting_date: string;
  status: TodoStatus;
  priority: TodoPriority;
  prompt: GeneratedPrompt | null;
  meeting_id: string | null;
  origin: TodoOrigin;
  category: TodoCategory | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type ScreenshotRow = {
  id: string;
  todo_id: string;
  storage_path: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
};

export type MeetingRow = {
  id: string;
  user_id: string | null;
  project_id: string | null;
  group_id: string | null;
  title: string;
  meeting_date: string;
  video_name: string;
  video_size: number;
  status: MeetingStatus;
  error: string | null;
  summary: string;
  transcript: TranscriptSegment[];
  suggestions: SuggestedTodo[];
  segment_count: number;
  model: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingListRow = Omit<MeetingRow, 'transcript' | 'group_id'> & { group_id?: string | null };

export type TodoWithScreenshotsRow = TodoRow & { screenshots: ScreenshotRow[] };

export type ProjectInsert = Pick<ProjectRow, 'name' | 'description' | 'repo_path' | 'tech_stack' | 'color'> & { user_id: string } &
  Partial<Pick<ProjectRow, 'id' | 'group_id' | 'created_at' | 'updated_at'>>;

export type TodoInsert = Pick<TodoRow, 'title' | 'details' | 'meeting_date' | 'priority'> &
  Partial<
    Pick<
      TodoRow,
      'id' | 'project_id' | 'group_id' | 'status' | 'prompt' | 'meeting_id' | 'origin' | 'category' | 'created_at' | 'updated_at' | 'completed_at'
    >
  >;

export type ScreenshotInsert = Pick<ScreenshotRow, 'todo_id' | 'storage_path' | 'original_name' | 'mime_type' | 'size'> &
  Partial<Pick<ScreenshotRow, 'id' | 'created_at'>>;

export type MeetingInsert = Pick<MeetingRow, 'id' | 'title' | 'meeting_date' | 'video_name' | 'video_size' | 'status'> & { user_id: string } &
  Partial<Pick<MeetingRow, 'project_id' | 'group_id' | 'error' | 'summary' | 'transcript' | 'suggestions' | 'model' | 'created_at' | 'updated_at'>>;

export type ApiTokenRow = {
  id: string;
  user_id: string;
  name: string;
  token_hash: string;
  last_used_at: string | null;
  created_at: string;
};

export type ApiTokenInsert = Pick<ApiTokenRow, 'user_id' | 'name' | 'token_hash'>;

export type ApiTokenUpdate = Pick<ApiTokenRow, 'last_used_at'>;

export type RunRow = {
  id: string;
  user_id: string;
  project_id: string;
  mode: RunMode;
  status: RunStatus;
  todo_ids: string[];
  progress: RunTodoProgress[];
  summary: string | null;
  files_changed: RunFileChange[];
  started_at: string;
  ended_at: string | null;
  updated_at: string;
};

export type RunInsert = Pick<RunRow, 'id' | 'user_id' | 'project_id' | 'mode' | 'status' | 'todo_ids' | 'progress'> &
  Partial<Pick<RunRow, 'summary' | 'files_changed' | 'started_at' | 'ended_at' | 'updated_at'>>;

export type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

type Table<Row, Insert, Relationships> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: Relationships;
};

export type SupabaseSchema = {
  public: {
    Tables: {
      projects: Table<
        ProjectRow,
        ProjectInsert,
        [
          {
            foreignKeyName: 'projects_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'project_groups';
            referencedColumns: ['id'];
          },
        ]
      >;
      project_groups: Table<ProjectGroupRow, ProjectGroupInsert, []>;
      api_tokens: {
        Row: ApiTokenRow;
        Insert: ApiTokenInsert;
        Update: ApiTokenUpdate;
        Relationships: [];
      };
      runs: Table<
        RunRow,
        RunInsert,
        [
          {
            foreignKeyName: 'runs_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ]
      >;
      profiles: Table<ProfileRow, Pick<ProfileRow, 'id' | 'full_name' | 'email'>, []>;
      todos: Table<
        TodoRow,
        TodoInsert,
        [
          {
            foreignKeyName: 'todos_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'todos_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'project_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'todos_meeting_id_fkey';
            columns: ['meeting_id'];
            isOneToOne: false;
            referencedRelation: 'meetings';
            referencedColumns: ['id'];
          },
        ]
      >;
      meetings: Table<
        MeetingRow,
        MeetingInsert,
        [
          {
            foreignKeyName: 'meetings_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'meetings_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'project_groups';
            referencedColumns: ['id'];
          },
        ]
      >;
      screenshots: Table<
        ScreenshotRow,
        ScreenshotInsert,
        [
          {
            foreignKeyName: 'screenshots_todo_id_fkey';
            columns: ['todo_id'];
            isOneToOne: false;
            referencedRelation: 'todos';
            referencedColumns: ['id'];
          },
        ]
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
