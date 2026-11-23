import path from 'node:path';

import {
  featureOf,
  hasComputedImport,
  importsOf,
  isServerPackage,
  reachesServer,
  resolveLocal,
} from './import-graph.mjs';

function inspect(context, node) {
  const source = context.sourceCode.text;
  const client = /^\s*['"]use client['"]/m.test(source);
  checkServerMarker(context, node);
  if (client && hasComputedImport(source))
    context.report({ node, messageId: 'computed' });
  for (const specifier of importsOf(source)) {
    const target = resolveLocal(specifier, context.filename, context.cwd);
    checkFeature(context, node, target);
    if (client) checkClient(context, node, { target, specifier });
    checkDatabase(context, node, specifier);
  }
}

function checkServerMarker(context, node) {
  const relative = path
    .relative(context.cwd, context.filename)
    .replaceAll('\\', '/');
  if (!relative.startsWith('src/server/') || relative.includes('.test.'))
    return;
  if (!importsOf(context.sourceCode.text).includes('server-only'))
    context.report({ node, messageId: 'marker' });
}

function checkClient(context, node, dependency) {
  const { target, specifier } = dependency;
  if (
    isServerPackage(specifier) ||
    (target && reachesServer(target, context.cwd))
  ) {
    context.report({ node, messageId: 'clientServer' });
  }
}

function checkDatabase(context, node, specifier) {
  const relative = path
    .relative(context.cwd, context.filename)
    .replaceAll('\\', '/');
  const allowed = /^src\/server\/(?:db|dal)\//.test(relative);
  if (relative.startsWith('src/') && !allowed && isDatabaseImport(specifier))
    context.report({ node, messageId: 'database' });
}

function isDatabaseImport(specifier) {
  return specifier === 'pg' || specifier.startsWith('drizzle-orm');
}

function checkFeature(context, node, target) {
  if (!target) return;
  const from = featureOf(context.filename);
  const to = featureOf(target);
  if (from && to && from !== to) context.report({ node, messageId: 'feature' });
}

export const boundaries = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      feature:
        'Features cannot import another feature. Share through components/ui, lib or server.',
      clientServer:
        'Client modules cannot reach server-only modules, including through barrels.',
      database: 'Database access belongs under server/db and the server DAL.',
      marker: 'Server runtime modules must import server-only.',
      computed:
        'Use explicit client module imports so server boundaries can be verified.',
    },
  },
  create(context) {
    return {
      Program(node) {
        inspect(context, node);
      },
    };
  },
};
