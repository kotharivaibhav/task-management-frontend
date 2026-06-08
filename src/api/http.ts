const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '')

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${API_BASE_URL}/${normalizedPath}`
}

type ApiRequestInit = {
  method?: string
  headers?: Record<string, string>
  body?: unknown
}

type ApiErrorResponse = {
  message?: string
}

export async function apiRequest<T = unknown>(path: string, options: ApiRequestInit = {}) {
  const url = buildUrl(path)
  const { method = 'GET', headers = {}, body } = options

  const init: RequestInit = {
    method,
    headers: {
      ...headers,
      ...(body != null && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    },
  }

  if (body != null) {
    init.body = body instanceof FormData ? body : JSON.stringify(body)
  }

  let response: Response

  try {
    response = await fetch(url, init)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Network error: ${message}`)
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const serverMessage = (data as ApiErrorResponse)?.message
    throw new Error(serverMessage ?? response.statusText ?? 'Request failed')
  }

  return data as T
}
