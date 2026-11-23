import { z } from 'zod';

export const classSession = z.object({
  id: z.number().int(),
  classId: z.number().int(),
  scheduleId: z.number().int().nullable(),
  sessionDate: z.string().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  attendanceCode: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().nullable(),
});

export const createSessionInput = z.strictObject({
  classId: z.coerce.number().int().positive(),
  scheduleId: z.coerce.number().int().positive().optional(),
});

export const closeSessionInput = z.strictObject({
  classId: z.coerce.number().int().positive(),
});
