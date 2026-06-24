const DEFAULT_MWAFQ_API_BASE_URL = 'https://stagingapi.mwafq.com/';

export const MWAFQ_API_BASE_URL =
  process.env.MWAFQ_API_BASE_URL ?? DEFAULT_MWAFQ_API_BASE_URL;

export const config = {
  appName: 'Mwafq',
  appDescription: 'Your trusted platform',
  apiBaseUrl: MWAFQ_API_BASE_URL,
} as const;
