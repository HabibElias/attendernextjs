import { expect, it } from 'vitest';
import { readJson, safeFailure } from './result';
import { loginInput } from '@/lib/contracts/auth';

it('parses valid JSON request body', async () => {
  const request = new Request('https://attender.test', {
    method: 'POST',
    body: JSON.stringify({ email: 'test@example.com' }),
  });
  const data = await readJson(request);
  expect(data).toEqual({ email: 'test@example.com' });
});

it('rejects invalid JSON without reflecting internal data', async () => {
  const request = new Request('https://attender.test', {
    method: 'POST',
    body: 'not-valid-json',
  });
  await expect(readJson(request)).rejects.toThrow('INVALID_JSON');
});

it('caps oversized stream bytes', async () => {
  const request = new Request('https://attender.test', {
    method: 'POST',
    body: JSON.stringify({ data: 'a'.repeat(40000) }),
  });
  await expect(readJson(request)).rejects.toThrow('PAYLOAD_TOO_LARGE');
});

it('maps ZodError safely without exposing sensitive payload values', () => {
  const result = loginInput.safeParse({
    email: 'not-an-email',
    password: 'short',
  });
  if (result.success) throw new Error('Expected validation error');

  const failure = safeFailure(result.error);
  expect(failure.status).toBe(422);
  expect(failure.body.error.code).toBe('VALIDATION_FAILED');
  expect(JSON.stringify(failure)).not.toContain('not-an-email');
});
