import { z } from 'zod';

export const pickFolderSchema = z
  .object({ startPath: z.string().trim().optional() })
  .optional()
  .transform((value) => value ?? {});

export const inspectFolderSchema = z.object({ path: z.string().trim().min(1) });
