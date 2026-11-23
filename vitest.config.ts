import { defineConfig } from 'vitest/config';
import { serverTestResolve } from './tools/quality/server-test-resolve.ts';

export default defineConfig({
  resolve: serverTestResolve,
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tools/quality/**/*.test.ts'],
  },
});
