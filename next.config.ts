import type { NextConfig } from 'next';

import { MWAFQ_API_BASE_URL } from './src/shared/constants/config';

const mwafqApiHostname = new URL(MWAFQ_API_BASE_URL).hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: mwafqApiHostname,
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
