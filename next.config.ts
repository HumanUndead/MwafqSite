import type { NextConfig } from 'next';

// import { MWAFQ_API_BASE_URL } from './src/shared/constants/config';

const mwafqApiHostname = new URL(
  process.env.NEXT_PUBLIC_MWAFQ_REGISTER_URL ??
    'https://stagingapi.mwafq.com/api'
).hostname;

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
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
