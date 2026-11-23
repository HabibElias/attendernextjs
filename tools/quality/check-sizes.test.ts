import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';

import { cssSizeFailure } from './check-sizes.mjs';

const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'attender-css-limits-'),
);
const stylesheet = path.join(directory, 'probe.css');

afterEach(() => fs.rmSync(stylesheet, { force: true }));

it('rejects CSS with 250 nonblank, noncomment lines', () => {
  fs.writeFileSync(stylesheet, '.probe { color: red; }\n'.repeat(250));
  expect(cssSizeFailure(stylesheet)).toContain('250 code lines (maximum 200)');
});

it('allows 200 CSS lines and excludes multiline comments and blank lines', () => {
  fs.writeFileSync(
    stylesheet,
    '/*\ncomment\n*/\n\n'.repeat(100) + '.probe { color: red; }\n'.repeat(200),
  );
  expect(cssSizeFailure(stylesheet)).toBeUndefined();
});
