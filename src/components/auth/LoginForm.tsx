'use client';

import type { FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { AUTH_COPY } from '@/constants/auth';
import { useLoginForm } from '@/hooks/useLoginForm';
import { FormAlert } from './FormAlert';
import { PasswordInput } from './PasswordInput';

interface Props {
  next: string | null;
  initialError: string | null;
}

export function LoginForm({ next, initialError }: Props) {
  const form = useLoginForm(next);
  const error = form.formError ?? initialError;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void form.submit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && <FormAlert message={error} />}
      <Field label={AUTH_COPY.emailLabel} htmlFor="email" error={form.fieldErrors.email}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          autoFocus
          placeholder={AUTH_COPY.emailPlaceholder}
          value={form.values.email}
          onChange={(event) => form.setField('email', event.target.value)}
          icon={<Mail size={15} />}
          invalid={Boolean(form.fieldErrors.email)}
          aria-describedby={form.fieldErrors.email ? 'email-error' : undefined}
        />
      </Field>
      <Field label={AUTH_COPY.passwordLabel} htmlFor="password" error={form.fieldErrors.password}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder={AUTH_COPY.passwordPlaceholder}
          value={form.values.password}
          onChange={(event) => form.setField('password', event.target.value)}
          invalid={Boolean(form.fieldErrors.password)}
          aria-describedby={form.fieldErrors.password ? 'password-error' : undefined}
        />
      </Field>
      <Button type="submit" size="lg" className="mt-1 w-full" disabled={form.isPending}>
        {form.isPending && <Spinner size={15} />}
        {AUTH_COPY.loginSubmit}
      </Button>
    </form>
  );
}
