import { expect, it } from 'vitest';
import { actionError, actionResult } from './result';
import { loginInput } from '@/lib/contracts/auth';

it('returns success data wrapped in result payload with requestId', async () => {
  const result = await actionResult(async (requestId) => {
    return { ok: true, echo: requestId };
  });

  expect(result.data?.ok).toBe(true);
  expect(result.meta?.requestId).toBeDefined();
  expect(result.data?.echo).toBe(result.meta?.requestId);
});

it('maps ZodError to VALIDATION_FAILED with field details', () => {
  const parsed = loginInput.safeParse({ email: 'invalid', password: '' });
  if (parsed.success) throw new Error('Expected validation failure');

  const error = actionError(parsed.error);
  expect(error.code).toBe('VALIDATION_FAILED');
  expect(error.details?.fields.length).toBeGreaterThan(0);
});

it('masks unknown errors as INTERNAL_ERROR with safe message', () => {
  const error = actionError(new Error('Sensitive database credentials leak'));
  expect(error.code).toBe('INTERNAL_ERROR');
  expect(error.message).toBe('An unexpected error occurred.');
  expect(JSON.stringify(error)).not.toContain('Sensitive database');
});
