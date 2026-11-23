import 'server-only';
import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import { logBackendFailure } from '../observability';

export type ActionErrorPayload = {
  code: string;
  message: string;
  details?: {
    fields: Array<{ field: string; code: string; message: string }>;
  };
};

export async function actionResult<T>(
  operation: (requestId: string) => Promise<T>,
) {
  const reqId = randomUUID();
  try {
    return { data: await operation(reqId), meta: { requestId: reqId } };
  } catch (error) {
    const mapped = actionError(error);
    if (
      mapped.code === 'INTERNAL_ERROR' ||
      mapped.code === 'SERVICE_UNAVAILABLE'
    ) {
      logBackendFailure({ code: mapped.code, requestId: reqId });
    }
    return { error: mapped, meta: { requestId: reqId } };
  }
}

export function actionError(error: unknown): ActionErrorPayload {
  if (error instanceof ZodError) {
    return {
      code: 'VALIDATION_FAILED',
      message: 'Check the highlighted fields.',
      details: {
        fields: error.issues.map((issue) => ({
          field: issue.path.join('.') || 'form',
          code: 'INVALID_VALUE',
          message: 'Invalid field value.',
        })),
      },
    };
  }

  const rawCode = error instanceof Error ? error.message : '';
  const known = [
    'UNAUTHENTICATED',
    'FORBIDDEN',
    'CONFLICT',
    'NOT_FOUND',
    'PAYLOAD_TOO_LARGE',
    'SERVICE_UNAVAILABLE',
  ];

  if (known.includes(rawCode)) {
    return { code: rawCode, message: messageForAction(rawCode) };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred.',
  };
}

function messageForAction(code: string) {
  if (code === 'UNAUTHENTICATED') return 'Please sign in to continue.';
  if (code === 'FORBIDDEN') return 'Permission denied.';
  if (code === 'CONFLICT') return 'Conflict with existing state.';
  if (code === 'NOT_FOUND') return 'Resource not found.';
  return 'The action could not be completed.';
}
