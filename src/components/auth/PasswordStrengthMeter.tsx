import { PASSWORD_STRENGTH_LEVELS, PASSWORD_STRENGTH_SEGMENTS } from '@/constants/auth';
import { passwordStrength } from '@/lib/auth';
import { cn } from '@/lib/cn';

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const strength = passwordStrength(password);
  const level = PASSWORD_STRENGTH_LEVELS[strength];
  const filled = Math.max(strength, 1);

  return (
    <div className="animate-fade-in flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {Array.from({ length: PASSWORD_STRENGTH_SEGMENTS }, (_, index) => (
          <span
            key={index}
            className={cn('h-1 flex-1 rounded-full transition-colors duration-300', index < filled ? level.barClass : 'bg-line')}
          />
        ))}
      </div>
      <span className={cn('w-16 text-right text-xs font-medium', level.textClass)}>{level.label}</span>
    </div>
  );
}
