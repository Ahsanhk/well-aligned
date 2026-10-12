import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthSwitchLink } from '@/components/auth/AuthSwitchLink';
import { LoginForm } from '@/components/auth/LoginForm';
import { AUTH_COPY, AUTH_ERRORS, AUTH_ROUTES } from '@/constants/auth';
import { withNext } from '@/lib/auth';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = null, error } = await searchParams;
  return (
    <AuthCard
      title={AUTH_COPY.loginTitle}
      subtitle={AUTH_COPY.loginSubtitle}
      footer={<AuthSwitchLink prompt={AUTH_COPY.toSignupPrompt} label={AUTH_COPY.toSignupLink} href={withNext(AUTH_ROUTES.signup, next)} />}
    >
      <LoginForm next={next} initialError={error ? AUTH_ERRORS.callback : null} />
    </AuthCard>
  );
}
