'use client';

import { useCallback, useState } from 'react';
import type { z } from 'zod';
import { AUTH_ERRORS } from '@/constants/auth';
import { toFieldErrors } from '@/lib/auth-schemas';
import type { FieldErrors } from '@/types';

export function useAuthForm<Schema extends z.ZodType<Record<string, string>, Record<string, string>>>(
  schema: Schema,
  initial: z.input<Schema>,
  onValid: (values: z.output<Schema>) => Promise<string | null>,
) {
  type Values = z.input<Schema>;
  const [values, setValues] = useState<Values>(initial);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<Values>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const setField = useCallback(
    (key: keyof Values, value: string) => {
      setValues((current) => {
        const next = { ...current, [key]: value };
        if (hasSubmitted) {
          const result = schema.safeParse(next);
          setFieldErrors(result.success ? {} : toFieldErrors<Values>(result.error));
        }
        return next;
      });
      setFormError(null);
    },
    [hasSubmitted, schema],
  );

  const submit = useCallback(async () => {
    setHasSubmitted(true);
    const result = schema.safeParse(values);
    if (!result.success) {
      setFieldErrors(toFieldErrors<Values>(result.error));
      return;
    }
    setFieldErrors({});
    setFormError(null);
    setIsPending(true);
    try {
      const error = await onValid(result.data);
      if (error) setFormError(error);
    } catch {
      setFormError(AUTH_ERRORS.generic);
    } finally {
      setIsPending(false);
    }
  }, [onValid, schema, values]);

  return { values, setField, fieldErrors, formError, setFormError, isPending, submit };
}
