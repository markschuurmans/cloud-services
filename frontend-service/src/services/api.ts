import { getToken } from '@/services/auth'

type ApiRequestOptions = RequestInit & {
  headers?: Record<string, string>
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {})

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(path, {
    ...options,
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



