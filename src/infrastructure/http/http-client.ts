/** Error transport terklasifikasi sebelum dipetakan ke kegagalan domain. */
export class HttpError extends Error {
  readonly kind: 'http' | 'network' | 'timeout' | 'invalidResponse' | 'aborted'
  readonly status?: number
  readonly code?: string
  readonly serverMessage?: string
  readonly fieldErrors?: Record<string, string>

  constructor(
    kind: 'http' | 'network' | 'timeout' | 'invalidResponse' | 'aborted',
    status?: number,
    code?: string,
    serverMessage?: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(kind)
    this.kind = kind
    this.status = status
    this.code = code
    this.serverMessage = serverMessage
    this.fieldErrors = fieldErrors
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readErrorText(value: unknown) {
  if (typeof value !== 'string') return undefined
  const text = value.trim().slice(0, 500)
  return text || undefined
}

function readFieldErrors(payload: unknown) {
  if (!isRecord(payload)) return undefined
  const source = isRecord(payload.errors) ? payload.errors : isRecord(payload.field_errors) ? payload.field_errors : null
  const fieldErrors: Record<string, string> = {}
  if (source) {
    for (const [field, value] of Object.entries(source)) {
      if (!field || field.length > 100) continue
      const message = Array.isArray(value) ? readErrorText(value[0]) : readErrorText(value)
      if (message) fieldErrors[field] = message
    }
  } else {
    const entries = Array.isArray(payload.errors) ? payload.errors : Array.isArray(payload.field_errors) ? payload.field_errors : []
    for (const entry of entries) {
      if (!isRecord(entry)) continue
      const field = readErrorText(entry.field) ?? readErrorText(entry.name) ?? readErrorText(entry.path)
      const message = readErrorText(entry.message)
      const fieldName = field?.split(/[.[\]]/).filter(Boolean).at(-1)
      if (fieldName && fieldName.length <= 100 && message) fieldErrors[fieldName] = message
    }
  }
  return Object.keys(fieldErrors).length ? fieldErrors : undefined
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  accessToken?: string
  signal?: AbortSignal
}

/**
 * Membuat client JSON untuk endpoint API versi aplikasi.
 *
 * @param baseUrl - Host API tanpa suffix `/api/v1`.
 * @param fetcher - Transport fetch yang dapat diganti pada pengujian.
 * @returns Client request dengan timeout, pembatalan, dan error transport terklasifikasi.
 */
export function createHttpClient(baseUrl: string, fetcher: typeof fetch = fetch, getLanguage: () => string = () => 'id') {
  const root = baseUrl.replace(/\/$/, '')

  return {
    async request(path: string, options: RequestOptions = {}): Promise<unknown> {
      const controller = new AbortController()
      let timedOut = false
      const timeout = setTimeout(() => { timedOut = true; controller.abort() }, 10_000)
      const onAbort = () => controller.abort()
      options.signal?.addEventListener('abort', onAbort, { once: true })
      if (options.signal?.aborted) controller.abort()

      try {
        const response = await fetcher(`${root}/api/v1${path}`, {
          method: options.method ?? 'GET',
          headers: {
            'Accept': 'application/json',
            'Accept-Language': getLanguage(),
            ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
            ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
          },
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
          cache: 'no-store',
          signal: controller.signal,
        })
        const raw = await response.text()
        let payload: unknown
        try { payload = JSON.parse(raw) as unknown } catch { throw new HttpError('invalidResponse', response.status) }
        if (!response.ok) {
          const code = typeof payload === 'object' && payload !== null && 'code' in payload && typeof payload.code === 'string'
            ? payload.code : undefined
          const isClientError = response.status >= 400 && response.status < 500
          const serverMessage = isClientError && isRecord(payload) ? readErrorText(payload.message) : undefined
          const fieldErrors = response.status === 400 || response.status === 422 ? readFieldErrors(payload) : undefined
          throw new HttpError('http', response.status, code, serverMessage, fieldErrors)
        }
        return payload
      } catch (error) {
        if (timedOut) throw new HttpError('timeout')
        if (options.signal?.aborted) throw new HttpError('aborted')
        if (error instanceof HttpError) throw error
        throw new HttpError('network')
      } finally {
        clearTimeout(timeout)
        options.signal?.removeEventListener('abort', onAbort)
      }
    },
  }
}

/** Kontrak request HTTP yang dibagikan ke dependency module. */
export type HttpClient = ReturnType<typeof createHttpClient>
