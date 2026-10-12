export interface PickFolderRequest {
  startPath?: string;
}

export interface PickFolderResponse {
  path: string | null;
}

export interface InspectFolderRequest {
  path: string;
}

export interface FolderInspection {
  name: string;
  techStack: string;
  isGitRepo: boolean;
  stack: string[];
  path: string;
}

export type FolderDetectionStatus = 'idle' | 'detecting' | 'detected' | 'error';
