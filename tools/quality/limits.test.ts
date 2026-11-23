import { ESLint } from 'eslint';
import path from 'node:path';
import { beforeAll, expect, it } from 'vitest';

const eslint = new ESLint();
const fixturePath = path.join(process.cwd(), 'src/lib/quality-fixture.ts');

beforeAll(async () => {
  await eslint.calculateConfigForFile(fixturePath);
});

async function rulesReported(source: string) {
  const [result] = await eslint.lintText(source, {
    filePath: fixturePath,
  });
  return result.messages.map((message) => message.ruleId);
}

it('rejects a handwritten file with more than 200 code lines', async () => {
  const source = Array.from(
    { length: 201 },
    (_, index) => `export const v${index} = ${index};`,
  ).join('\n');
  expect(await rulesReported(source)).toContain('max-lines');
});

it('rejects a function with more than 60 code lines', async () => {
  const body = Array.from(
    { length: 61 },
    () => 'console.log("synthetic");',
  ).join('\n');
  expect(
    await rulesReported(`export function tooLong() {\n${body}\n}`),
  ).toContain('max-lines-per-function');
});

it('rejects complexity greater than 10', async () => {
  const branches = Array.from(
    { length: 11 },
    (_, index) => `if (n === ${index}) return ${index};`,
  ).join('\n');
  expect(
    await rulesReported(
      `export function branches(n: number) {\n${branches}\nreturn 0;\n}`,
    ),
  ).toContain('complexity');
});

it('rejects a fifth parameter', async () => {
  const source =
    'export function params(a: number,b: number,c: number,d: number,e: number) { return a+b+c+d+e; }';
  expect(await rulesReported(source)).toContain('max-params');
});
