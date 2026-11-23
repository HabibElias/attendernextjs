import type { NextConfig } from 'next';

import { parseServerEnv } from './src/lib/env/schema';

parseServerEnv(process.env);

const config: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
};

export default config;
