import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { COPY } from '@/constants/app';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isDisabled?: boolean;
  hasResult: boolean;
}

export function PromptComposer({ value, onChange, onGenerate, isLoading, isDisabled = false, hasResult }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Field label="Extra instructions" htmlFor="prompt-extra" hint="Optional">
        <Textarea
          id="prompt-extra"
          rows={2}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={COPY.extraInstructionsPlaceholder}
        />
      </Field>
      <div className="flex items-center justify-between gap-3">
        {!hasResult && <p className="text-xs text-subtle">{COPY.promptEmpty}</p>}
        <Button onClick={onGenerate} disabled={isLoading || isDisabled} variant={hasResult ? 'secondary' : 'primary'} className="ml-auto">
          <Sparkles size={15} />
          {isLoading ? 'Generating…' : hasResult ? 'Regenerate' : 'Generate prompt'}
        </Button>
      </div>
    </div>
  );
}
