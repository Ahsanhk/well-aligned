'use client';

import type { FormEvent } from 'react';
import { Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { AUTH_COPY, FULL_NAME_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/constants/auth';
import type { useSignupForm } from '@/hooks/useSignupForm';
import { FormAlert } from './FormAlert';
import { PasswordInput } from './PasswordInput';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface Props {
  form: ReturnType<typeof useSignupForm>;
}

export function SignupForm({ form }: Props) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void form.submit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {form.formError && <FormAlert message={form.formError} />}
      <Field label={AUTH_COPY.fullNameLabel} htmlFor="fullName" error={form.fieldErrors.fullName}>
        <Input
          id="fullName"
          autoComplete="name"
          autoCapitalize="words"
          autoFocus
          maxLength={FULL_NAME_MAX_LENGTH}
          placeholder={AUTH_COPY.fullNamePlaceholder}
          value={form.values.fullName}
          onChange={(event) => form.setField('fullName', event.target.value)}
          icon={<User size={15} />}
          invalid={Boolean(form.fieldErrors.fullName)}
          aria-describedby={form.fieldErrors.fullName ? 'fullName-error' : undefined}
        />
      </Field>
      <Field label={AUTH_COPY.emailLabel} htmlFor="email" error={form.fieldErrors.email}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          placeholder={AUTH_COPY.emailPlaceholder}
          value={form.values.email}
          onChange={(event) => form.setField('email', event.target.value)}
          icon={<Mail size={15} />}
          invalid={Boolean(form.fieldErrors.email)}
          aria-describedby={form.fieldErrors.email ? 'email-error' : undefined}
        />
      </Field>
      <Field
        label={AUTH_COPY.passwordLabel}
        htmlFor="password"
        hint={`${PASSWORD_MIN_LENGTH}+ characters`}
        error={form.fieldErrors.password}
        description={<PasswordStrengthMeter password={form.values.password} />}
      >
        <PasswordInput
          id="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          placeholder={AUTH_COPY.passwordPlaceholder}
          value={form.values.password}
          onChange={(event) => form.setField('password', event.target.value)}
          invalid={Boolean(form.fieldErrors.password)}
          aria-describedby={form.fieldErrors.password ? 'password-error' : undefined}
        />
      </Field>
      <Button type="submit" size="lg" className="mt-1 w-full" disabled={form.isPending}>
        {form.isPending && <Spinner size={15} />}
        {AUTH_COPY.signupSubmit}
      </Button>
    </form>
  );
}
