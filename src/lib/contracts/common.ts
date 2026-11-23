import { z } from 'zod';

export const text = (max: number) => z.string().trim().min(1).max(max);

export const id = z.string().uuid();
export const email = z.string().trim().toLowerCase().pipe(z.email());
export const userRole = z.enum(['teacher', 'student']);

export const pagination = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
