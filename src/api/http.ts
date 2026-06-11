const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '')

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${API_BASE_URL}/${normalizedPath}`
}

type RequestOptions = {
  method?: string
  headers?: Record<string, string>
  body?: unknown
  token?: string | null
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, token } = options

  const requestHeaders: Record<string, string> = { ...headers }
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const init: RequestInit = { method, headers: requestHeaders }

  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body
    } else {
      requestHeaders['Content-Type'] = 'application/json'
      init.body = JSON.stringify(body)
    }
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path), init)
  } catch {
    throw new Error('Network error: unable to reach the server')
  }

  const text = await response.text()
  const payload = text ? JSON.parse(text) : {}

  if (!response.ok) {
    throw new Error(payload.message || payload.error || response.statusText || 'Request failed')
  }

  return payload as T
}
