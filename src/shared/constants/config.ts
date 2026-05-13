const DEFAULT_MWAFQ_API_BASE_URL = 'http://localhost:5080'

export const MWAFQ_API_BASE_URL =
  process.env.MWAFQ_API_BASE_URL ?? DEFAULT_MWAFQ_API_BASE_URL

export const config = {
  appName: 'Mwafq',
  appDescription: 'Your trusted platform',
  apiBaseUrl: MWAFQ_API_BASE_URL,
} as const
