import { z } from 'zod';
import { email, text, userRole } from './common';

export const loginInput = z.strictObject({
  email,
  password: z.string().min(6).max(128),
});

export const signupInput = z.strictObject({
  email,
  password: z.string().min(6).max(128),
  fullName: text(120),
});

export const authSession = z.object({
  userId: z.string(),
  email: z.string(),
  role: userRole.nullable(),
  profileComplete: z.boolean(),
});
