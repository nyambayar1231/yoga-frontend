import { z } from 'zod'
import { apiFetchParsed, pageSchema } from '@/lib/api'
import { USER_ROLES, type UserRole } from '@/features/auth/auth.api'

/**
 * One account as the backend serialises it. Mongoose hides `passwordHash` and
 * renames `_id`, so `id` is a plain string here.
 */
export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(USER_ROLES),
  isActive: z.boolean(),
  /** Set only for role 'student'. */
  studentId: z.string().nullish(),
  /** Set only for role 'teacher'. */
  teacherId: z.string().nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type User = z.infer<typeof userSchema>

const usersPageSchema = pageSchema(userSchema)

export type UsersPage = z.infer<typeof usersPageSchema>

export interface UsersFilter {
  /** The backend takes one role at a time, not a list. */
  role?: UserRole
  isActive?: boolean
  /** Which account holds this student profile — a profile knows nothing of its login. */
  studentId?: string
  limit?: number
}

/** GET /api/users — admin only. Answers with `{ data, total, limit, skip }`. */
export function fetchUsers(filter: UsersFilter = {}): Promise<UsersPage> {
  const query = new URLSearchParams()
  if (filter.role !== undefined) query.set('role', filter.role)
  if (filter.isActive !== undefined) query.set('isActive', String(filter.isActive))
  if (filter.studentId !== undefined) query.set('studentId', filter.studentId)
  if (filter.limit !== undefined) query.set('limit', String(filter.limit))

  const search = query.toString()
  return apiFetchParsed(search === '' ? '/users' : `/users?${search}`, usersPageSchema)
}

/**
 * The body POST /api/users accepts. `role` is required, and the backend rejects
 * 'teacher' and 'student' unless the matching profile id comes with it — those
 * logins are created through POST /api/teachers and POST /api/students.
 */
export const createUserSchema = z.object({
  // Normalise before validating: z.email() would reject a padded address
  // outright rather than trimming it first.
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string(),
  role: z.enum(USER_ROLES),
})

export type CreateUserInput = z.input<typeof createUserSchema>

/** POST /api/users — admin only. 201 with the created user as the body. */
export function createUser(input: CreateUserInput): Promise<User> {
  return apiFetchParsed('/users', userSchema, {
    method: 'POST',
    body: JSON.stringify(createUserSchema.parse(input)),
  })
}

/** Longest message body POST /api/users/:id/email accepts. */
export const EMAIL_TEXT_MAX_LENGTH = 5_000

/** Longest subject it accepts. Omitting one lets the backend supply its own. */
export const EMAIL_SUBJECT_MAX_LENGTH = 200

export const sendUserEmailSchema = z.object({
  subject: z.string().trim().min(1).max(EMAIL_SUBJECT_MAX_LENGTH),
  text: z.string().trim().min(1).max(EMAIL_TEXT_MAX_LENGTH),
})

export type SendUserEmailInput = z.input<typeof sendUserEmailSchema>

/** What the backend reports once the provider has taken the message. */
const sentMessageSchema = z.object({
  /** The provider's message id, for looking the delivery up later. */
  id: z.string(),
  /** The address it actually went to, which is the account's, not the profile's. */
  to: z.string(),
})

export type SentMessage = z.infer<typeof sentMessageSchema>

/**
 * POST /api/users/:id/email — admin only. Blocking: it answers once the
 * message has gone out, so a 2xx here means it was sent, not queued.
 */
export function sendUserEmail(
  userId: string,
  input: SendUserEmailInput,
): Promise<SentMessage> {
  return apiFetchParsed(`/users/${userId}/email`, sentMessageSchema, {
    method: 'POST',
    body: JSON.stringify(sendUserEmailSchema.parse(input)),
  })
}
