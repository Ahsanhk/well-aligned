'use client';

import { ArrowLeft, MailCheck, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AUTH_COPY } from '@/constants/auth';
import { useResendConfirmation } from '@/hooks/useResendConfirmation';
import { FormAlert } from './FormAlert';

interface Props {
  email: string;
  next: string | null;
  onBack: () => void;
}

export function CheckInbox({ email, next, onBack }: Props) {
  const { resend, cooldown, isPending, error, wasResent, canResend } = useResendConfirmation(email, next);

  return (
    <div className="animate-fade-in flex flex-col items-center gap-5 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent shadow-[0_0_32px_-8px_var(--color-accent)]">
        <MailCheck size={22} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-fg">{AUTH_COPY.checkInboxTitle}</h2>
        <p className="text-sm text-muted">
          {AUTH_COPY.checkInboxBody} <span className="font-medium break-all text-fg">{email}</span>
        </p>
        <p className="text-xs text-subtle">{AUTH_COPY.checkInboxHint}</p>
      </div>
      {error && <FormAlert message={error} />}
      {wasResent && !error && <p className="animate-fade-in text-xs text-success">{AUTH_COPY.resent}</p>}
      <div className="flex w-full flex-col gap-2">
        <Button variant="secondary" size="lg" className="w-full" onClick={() => void resend()} disabled={!canResend}>
          {isPending ? <Spinner size={15} /> : <RotateCw size={15} />}
          {cooldown > 0 ? AUTH_COPY.resendIn(cooldown) : AUTH_COPY.resend}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onBack}>
          <ArrowLeft size={15} />
          {AUTH_COPY.useDifferentEmail}
        </Button>
      </div>
    </div>
  );
}
