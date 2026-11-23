import { z } from 'zod';
import { id, userRole } from './common';

export const profileRecord = z.object({
  id,
  role: userRole,
});

export const setupProfileInput = z.strictObject({
  userId: id,
  role: userRole,
});
