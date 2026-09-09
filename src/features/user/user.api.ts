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
  /** Set only for role 'member'. */
  memberId: z.string().nullish(),
  /** Set only for roles 'instructor' and 'admin'. */
  instructorId: z.string().nullish(),
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
  limit?: number
}

/** GET /api/users — admin only. Answers with `{ data, total, limit, skip }`. */
export function fetchUsers(filter: UsersFilter = {}): Promise<UsersPage> {
  const query = new URLSearchParams()
  if (filter.role !== undefined) query.set('role', filter.role)
  if (filter.isActive !== undefined) query.set('isActive', String(filter.isActive))
  if (filter.limit !== undefined) query.set('limit', String(filter.limit))

  const search = query.toString()
  return apiFetchParsed(search === '' ? '/users' : `/users?${search}`, usersPageSchema)
}

/**
 * The body POST /api/users accepts. `role` is required, and the backend rejects
 * 'instructor' and 'member' unless the matching profile id comes with it — those
 * logins are created through POST /api/instructors and POST /api/members.
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
