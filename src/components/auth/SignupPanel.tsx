'use client';

import { AUTH_COPY, AUTH_ROUTES } from '@/constants/auth';
import { withNext } from '@/lib/auth';
import { useSignupForm } from '@/hooks/useSignupForm';
import { AuthCard } from './AuthCard';
import { AuthSwitchLink } from './AuthSwitchLink';
import { CheckInbox } from './CheckInbox';
import { SignupForm } from './SignupForm';

export function SignupPanel({ next }: { next: string | null }) {
  const form = useSignupForm(next);
  const footer = <AuthSwitchLink prompt={AUTH_COPY.toLoginPrompt} label={AUTH_COPY.toLoginLink} href={withNext(AUTH_ROUTES.login, next)} />;

  if (form.pendingEmail) {
    return (
      <AuthCard title={AUTH_COPY.signupTitle} subtitle={AUTH_COPY.signupSubtitle} footer={footer}>
        <CheckInbox email={form.pendingEmail} next={next} onBack={form.resetPending} />
      </AuthCard>
    );
  }

  return (
    <AuthCard title={AUTH_COPY.signupTitle} subtitle={AUTH_COPY.signupSubtitle} footer={footer}>
      <SignupForm form={form} />
    </AuthCard>
  );
}
