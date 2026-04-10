import { getToken } from '@/services/auth'

type ApiRequestOptions = RequestInit & {
  headers?: Record<string, string>
  baseUrl?: string
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { baseUrl, ...fetchOptions } = options
  const headers = new Headers(fetchOptions.headers || {})

  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const requestUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}${path}` : path

  const response = await fetch(requestUrl, {
    ...fetchOptions,
    headers: Object.fromEntries(headers.entries()),
  })

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    payload = undefined
  }

  if (!response.ok) {
    const details =
      payload && typeof payload === 'object'
        ? ((payload as { message?: string; error?: string }).message ||
            (payload as { message?: string; error?: string }).error)
        : undefined
    throw new Error(details || response.statusText)
  }

  return payload as T
}



