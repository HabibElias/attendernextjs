import { z } from 'zod';
import { text } from './common';

export const dayOfWeek = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]);

export const schedulePayload = z.strictObject({
  day: dayOfWeek,
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
});

export const createClassInput = z.strictObject({
  name: text(100),
  icon: text(50).default('default'),
  schedules: z.array(schedulePayload).min(1),
});

export const updateClassInput = z.strictObject({
  classId: z.coerce.number().int().positive(),
  name: text(100),
  icon: text(50),
  schedules: z.array(schedulePayload).min(1),
});
