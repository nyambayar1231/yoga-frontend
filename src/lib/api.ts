const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** A non-2xx response from the backend, carrying its status and message. */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** The backend reports failures as `{ error: string }`. */
function readErrorMessage(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) return null
  const { error } = payload as Record<string, unknown>
  return typeof error === 'string' ? error : null
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    // Auth is an httpOnly cookie, so it has to ride along on every request.
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(response.status, readErrorMessage(payload) ?? response.statusText)
  }

  return payload as T
}
