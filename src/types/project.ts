export interface Project {
  id: string;
  name: string;
  description: string;
  repoPath: string;
  techStack: string;
  color: ProjectColor;
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectColor = 'cyan' | 'indigo' | 'violet' | 'teal' | 'sky' | 'rose';

export type ProjectInput = Pick<Project, 'name' | 'description' | 'repoPath' | 'techStack' | 'color'> & Partial<Pick<Project, 'groupId'>>;

export interface ProjectSummary extends Project {
  todoCount: number;
  openCount: number;
  doneCount: number;
  backlogOpenCount: number;
  highPriorityOpenCount: number;
}
