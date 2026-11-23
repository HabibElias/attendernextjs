import { z } from 'zod';

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    schema.optional(),
  );

const url = optional(z.url({ protocol: /^https?$/ }));
const secret = optional(z.string().min(16));

export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  NEXT_PUBLIC_APP_URL: url.default('http://localhost:3000'),
  GO_API_URL: url.default('http://localhost:8080/api'),
  SESSION_SECRET: secret,
  DATABASE_URL: optional(z.string()),
  DEMO_MODE: z.enum(['true', 'false']).default('true'),
});

export function parseServerEnv(input: Record<string, unknown>) {
  const result = serverEnvSchema.safeParse(input);
  if (result.success) return result.data;
  const fields = [
    ...new Set(result.error.issues.map((issue) => issue.path[0])),
  ];
  throw new Error(`Invalid server environment fields: ${fields.join(', ')}`);
}
