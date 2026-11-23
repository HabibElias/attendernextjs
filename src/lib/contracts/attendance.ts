import { z } from 'zod';
import { email, id, text } from './common';

export const attendanceCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{6,8}$/);

export const submitAttendanceInput = z.strictObject({
  code: attendanceCode,
});

export const attendeeRecord = z.object({
  id,
  name: text(120),
  email: email.nullable(),
});
