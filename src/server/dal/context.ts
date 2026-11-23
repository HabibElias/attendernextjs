import 'server-only';
import { randomUUID } from 'node:crypto';

export type BackendContext = {
  sessionId?: string;
  userId?: string;
  role?: 'teacher' | 'student';
  requestId?: string;
};

export function requestId(ctx: BackendContext) {
  return ctx.requestId ?? randomUUID();
}
