import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const extensions = [
  '.ts',
  '.tsx',
  '.mts',
  '.js',
  '.jsx',
  '.mjs',
  '/index.ts',
  '/index.tsx',
];
const serverPackages = new Set([
  'server-only',
  'pg',
  'resend',
  'better-auth',
  'next/headers',
  'next-intl/server',
  'node:fs',
  'fs',
  'node:crypto',
  'crypto',
]);

export function importsOf(source) {
  const syntax = ts.createSourceFile(
    'module.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const imports = [];
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier
    ) {
      imports.push(node.moduleSpecifier.text);
    }
    if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      if (
        node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        node.expression.getText(syntax) === 'require'
      )
        imports.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
  visit(syntax);
  return imports;
}

export function resolveLocal(specifier, importer, root) {
  let base;
  if (specifier.startsWith('@/'))
    base = path.join(root, 'src', specifier.slice(2));
  else if (specifier.startsWith('.'))
    base = path.resolve(path.dirname(importer), specifier);
  else return undefined;
  return [base, ...extensions.map((extension) => base + extension)].find(
    (file) => fs.existsSync(file) && fs.statSync(file).isFile(),
  );
}

export function featureOf(filename) {
  return filename
    .replaceAll('\\', '/')
    .match(/\/src\/features\/([^/]+)\//)?.[1];
}

export function reachesServer(filename, root, visited = new Set()) {
  if (visited.has(filename)) return false;
  visited.add(filename);
  const source = fs.readFileSync(filename, 'utf8');
  if (/^\s*['"]use server['"]/m.test(source)) return false;
  if (filename.includes('/src/server/') || hasComputedImport(source))
    return true;
  return importsOf(source).some((specifier) => {
    if (serverPackages.has(specifier) || specifier.startsWith('drizzle-orm'))
      return true;
    const dependency = resolveLocal(specifier, filename, root);
    return dependency ? reachesServer(dependency, root, visited) : false;
  });
}

export function isServerPackage(specifier) {
  return serverPackages.has(specifier) || specifier.startsWith('drizzle-orm');
}

export function hasComputedImport(source) {
  const syntax = ts.createSourceFile(
    'module.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let computed = false;
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const loadsModule =
        node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        node.expression.getText(syntax) === 'require';
      if (
        loadsModule &&
        node.arguments[0] &&
        !ts.isStringLiteralLike(node.arguments[0])
      )
        computed = true;
    }
    ts.forEachChild(node, visit);
  }
  visit(syntax);
  return computed;
}
