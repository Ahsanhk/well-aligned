export type PromptSource = 'ai' | 'template';

export interface GeneratedPrompt {
  text: string;
  source: PromptSource;
  model: string | null;
  generatedAt: string;
}

export interface PromptRequest {
  projectId: string;
  todoIds: string[];
  extraInstructions: string;
}

export interface PromptResponse {
  prompt: GeneratedPrompt;
  todoIds: string[];
  warning: string | null;
}
