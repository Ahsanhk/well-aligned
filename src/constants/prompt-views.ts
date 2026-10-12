import { Braces, Sparkles, type LucideIcon } from 'lucide-react';
import type { PromptView } from '@/types';

export const PROMPT_VIEW_OPTIONS: { value: PromptView; label: string; icon: LucideIcon }[] = [
  { value: 'prompt', label: 'Prompt', icon: Sparkles },
  { value: 'json', label: 'JSON', icon: Braces },
];

export const DEFAULT_PROMPT_VIEW: PromptView = 'prompt';
