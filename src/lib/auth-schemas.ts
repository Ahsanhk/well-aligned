import { z } from 'zod';
import { FULL_NAME_MAX_LENGTH, PASSWORD_MIN_LENGTH, VALIDATION_MESSAGES } from '@/constants/auth';
import type { FieldErrors } from '@/types';

const email = z.string().trim().pipe(z.email(VALIDATION_MESSAGES.emailInvalid));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, VALIDATION_MESSAGES.passwordRequired),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, VALIDATION_MESSAGES.fullNameRequired)
    .max(FULL_NAME_MAX_LENGTH, VALIDATION_MESSAGES.fullNameTooLong)
    .transform((value) => value.replace(/\s+/g, ' ')),
  email,
  password: z.string().min(PASSWORD_MIN_LENGTH, VALIDATION_MESSAGES.passwordTooShort),
});

export function toFieldErrors<Values>(error: z.ZodError): FieldErrors<Values> {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const key = String(issue.path[0] ?? '');
    if (key && !errors[key]) errors[key] = issue.message;
  });
  return errors as FieldErrors<Values>;
}
