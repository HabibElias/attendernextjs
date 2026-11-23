import { fileURLToPath } from 'node:url';

// Test runners are a trusted server environment, not a React compiler. Only
// Vitest uses this mapping; Next and the ESLint client graph retain real guards.
export const serverTestResolve = {
  alias: {
    'server-only': fileURLToPath(
      new URL('../../node_modules/server-only/empty.js', import.meta.url),
    ),
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
};
