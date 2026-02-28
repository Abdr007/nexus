import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@nexus/shared', '@nexus/orchestrator', '@nexus/tools', '@nexus/memory'],
};

export default nextConfig;
