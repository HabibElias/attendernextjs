import { httpResult } from '@/server/http/result';

export const runtime = 'nodejs';

export async function GET() {
  return httpResult(async () => {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  });
}
