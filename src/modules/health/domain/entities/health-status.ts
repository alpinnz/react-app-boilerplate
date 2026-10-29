/** Ringkasan ketersediaan API dan database dari endpoint health. */
export type HealthStatus = { api: 'ok' | 'error'; database: 'ok' | 'error' }
