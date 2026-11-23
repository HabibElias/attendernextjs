import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

export function cssSizeFailure(filename) {
  const source = postcss.parse(fs.readFileSync(filename, 'utf8'));
  source.walkComments((comment) => comment.remove());
  const count = source
    .toString()
    .split('\n')
    .filter((line) => line.trim()).length;
  return count > 200
    ? `${filename}: ${count} code lines (maximum 200)`
    : undefined;
}

function stylesheetFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return stylesheetFiles(filename);
    return entry.name.endsWith('.css') ? [filename] : [];
  });
}

function main() {
  const errors = stylesheetFiles(path.join(root, 'src'))
    .map(cssSizeFailure)
    .filter(Boolean);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else console.log('Product CSS size limits pass (Node-only).');
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main();
