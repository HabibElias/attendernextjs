import { expect, it } from 'vitest';
import { parseServerEnv } from './schema';

it('defaults to development environment with local URLs', () => {
  const env = parseServerEnv({});
  expect(env.NODE_ENV).toBe('development');
  expect(env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
  expect(env.GO_API_URL).toBe('http://localhost:8080/api');
});

it('parses valid custom environment values', () => {
  const env = parseServerEnv({
    NODE_ENV: 'production',
    NEXT_PUBLIC_APP_URL: 'https://attender.app',
    GO_API_URL: 'https://api.attender.app/api',
  });
  expect(env.NODE_ENV).toBe('production');
  expect(env.NEXT_PUBLIC_APP_URL).toBe('https://attender.app');
  expect(env.GO_API_URL).toBe('https://api.attender.app/api');
});
