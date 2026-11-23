import 'server-only';
import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import { logBackendFailure } from '../observability';

const statuses: Record<string, number> = {
  INVALID_JSON: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  ALREADY_EXISTS: 409,
  PAYLOAD_TOO_LARGE: 413,
  VALIDATION_FAILED: 422,
  RATE_LIMITED: 429,
  SERVICE_UNAVAILABLE: 503,
};

export function safeFailure(error: unknown, requestId = randomUUID()) {
  if (error instanceof ZodError) {
    return {
      status: 422,
      body: {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Check the highlighted fields.',
          details: {
            fields: error.issues.map((issue) => ({
              field: issue.path.join('.') || 'form',
              code: 'INVALID_VALUE',
              message: 'Check this field.',
            })),
          },
        },
        meta: { requestId },
      },
    };
  }

  const code =
    error instanceof Error && statuses[error.message]
      ? error.message
      : 'INTERNAL_ERROR';

  return {
    status: statuses[code] ?? 500,
    body: {
      error: {
        code,
        message:
          code === 'INTERNAL_ERROR'
            ? 'The request could not be completed.'
            : messageFor(code),
      },
      meta: { requestId },
    },
  };
}

function messageFor(code: string) {
  if (code === 'CONFLICT') return 'Conflict with existing state.';
  if (code === 'UNAUTHENTICATED') return 'Please sign in to continue.';
  if (code === 'FORBIDDEN') return 'Permission denied.';
  if (code === 'NOT_FOUND') return 'Resource not found.';
  if (code === 'RATE_LIMITED') return 'Too many requests. Try again later.';
  return 'The request could not be completed.';
}

export async function httpResult(
  operation: () => Promise<unknown>,
  status = 200,
) {
  try {
    return Response.json(await operation(), {
      status,
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    const result = safeFailure(error);
    const code = result.body.error.code;
    if (code === 'INTERNAL_ERROR' || code === 'SERVICE_UNAVAILABLE') {
      logBackendFailure({ code, requestId: result.body.meta.requestId });
    }
    return Response.json(result.body, {
      status: result.status,
      headers: { 'cache-control': 'no-store' },
    });
  }
}

export async function readBytes(request: Request, limit = 32768) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('INVALID_JSON');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new Error('PAYLOAD_TOO_LARGE');
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function readJson(request: Request, limit = 32768) {
  const bytes = await readBytes(request, limit);
  try {
    return JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    ) as unknown;
  } catch {
    throw new Error('INVALID_JSON');
  }
}
