import { z } from 'zod'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** A non-2xx response from the backend, carrying its status, code and message. */
export class ApiError extends Error {
  status: number
  /** The backend's machine-readable reason, e.g. `EMAIL_IN_USE`. */
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/**
 * A 2xx response whose body is not what the endpoint promised. Separate from
 * ApiError: the request succeeded, our idea of the contract is what is wrong.
 */
export class ApiSchemaError extends Error {
  constructor(path: string, error: z.ZodError) {
    const summary = error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'} ${issue.message}`)
      .join('; ')

    super(`Unexpected response from ${path}: ${summary}`)
    this.name = 'ApiSchemaError'
  }
}

/** The backend reports failures as `{ code, error, details? }`. */
const errorPayload = z.object({ code: z.string(), error: z.string() })

/** Uniform list envelope: `total` is the full match count, not the page size. */
export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({
    data: z.array(item),
    total: z.number().int(),
    limit: z.number().int(),
    skip: z.number().int(),
  })
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
    const failure = errorPayload.safeParse(payload)
    throw failure.success
      ? new ApiError(response.status, failure.data.code, failure.data.error)
      : new ApiError(response.status, 'UNKNOWN', response.statusText)
  }

  return payload as T
}

/**
 * `apiFetch` that checks the body against the shape we expect instead of
 * asserting it, so a drifted contract fails here rather than deep in a render.
 */
export async function apiFetchParsed<S extends z.ZodType>(
  path: string,
  schema: S,
  init?: RequestInit,
): Promise<z.infer<S>> {
  const payload = await apiFetch<unknown>(path, init)

  const result = schema.safeParse(payload)
  if (!result.success) throw new ApiSchemaError(path, result.error)

  return result.data
}
