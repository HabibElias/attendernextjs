import { ESLint } from 'eslint';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';

import { boundaries } from './boundary-rules.mjs';

const directories: string[] = [];
afterEach(() =>
  directories
    .splice(0)
    .forEach((directory) =>
      rmSync(directory, { recursive: true, force: true }),
    ),
);

async function lintFixture(files: Record<string, string>, entry: string) {
  const root = mkdtempSync(path.join(tmpdir(), 'attender-boundary-'));
  directories.push(root);
  for (const [name, source] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), source);
  }
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: [
      {
        plugins: { architecture: { rules: { boundaries } } },
        rules: { 'architecture/boundaries': 'error' },
      },
    ],
  });
  const [result] = await eslint.lintFiles([path.join(root, entry)]);
  return result.messages.map((message) => message.messageId);
}

it('blocks imports into another feature', async () => {
  const messages = await lintFixture(
    {
      'src/features/inquiry/view.js': 'import "../staff-auth/private.js";',
      'src/features/staff-auth/private.js': 'export const value = 1;',
    },
    'src/features/inquiry/view.js',
  );
  expect(messages).toContain('feature');
});

it('blocks client access through a shared barrel to server code', async () => {
  const messages = await lintFixture(
    {
      'src/components/view.js': '"use client"; import "../lib/barrel.js";',
      'src/lib/barrel.js': 'export * from "../server/database.js";',
      'src/server/database.js': 'import "server-only";',
    },
    'src/components/view.js',
  );
  expect(messages).toContain('clientServer');
});

it('allows client consumption of pure shared contracts', async () => {
  const messages = await lintFixture(
    {
      'src/features/inquiry/view.js':
        '"use client"; import "../../lib/schema.js";',
      'src/lib/schema.js': 'export const value = 1;',
    },
    'src/features/inquiry/view.js',
  );
  expect(messages).toEqual([]);
});

it('blocks direct client database packages', async () => {
  const messages = await lintFixture(
    {
      'src/features/inquiry/view.js': '"use client"; import "pg";',
    },
    'src/features/inquiry/view.js',
  );
  expect(messages).toContain('clientServer');
  expect(messages).toContain('database');
});

it('allows framework Server Action references without traversing their server imports', async () => {
  const messages = await lintFixture(
    {
      'src/components/view.js': '"use client"; import "../server/action.js";',
      'src/server/action.js':
        '"use server"; import "server-only"; export async function save() {}',
    },
    'src/components/view.js',
  );
  expect(messages).toEqual([]);
});

it('rejects computed client imports that cannot be checked safely', async () => {
  const messages = await lintFixture(
    {
      'src/components/view.js':
        '\"use client\"; const moduleName = \"../server/database.js\"; import(moduleName);',
    },
    'src/components/view.js',
  );
  expect(messages).toContain('computed');
});

it('requires the framework marker on runtime server modules', async () => {
  const messages = await lintFixture(
    {
      'src/server/unmarked.js': 'export const privateValue = 1;',
    },
    'src/server/unmarked.js',
  );
  expect(messages).toContain('marker');
});
