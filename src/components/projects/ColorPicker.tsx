import { Check } from 'lucide-react';
import { PROJECT_COLOR_CLASSES, PROJECT_COLOR_OPTIONS } from '@/constants/project-colors';
import { cn } from '@/lib/cn';
import type { ProjectColor } from '@/types';

interface Props {
  value: ProjectColor;
  onChange: (color: ProjectColor) => void;
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Project color" className="flex flex-wrap gap-2">
      {PROJECT_COLOR_OPTIONS.map((option) => {
        const colors = PROJECT_COLOR_CLASSES[option.value];
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-all duration-150',
              colors.soft,
              isActive ? cn('border-transparent ring-2', colors.ring) : 'border-line hover:border-line-strong',
            )}
          >
            <span className={cn('flex h-4 w-4 items-center justify-center rounded-full text-canvas', colors.dot, isActive && colors.glow)}>
              {isActive && <Check size={10} strokeWidth={3.5} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
