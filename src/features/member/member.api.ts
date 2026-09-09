import { z } from 'zod'
import { apiFetchParsed, pageSchema } from '@/lib/api'
import { userSchema } from '@/features/user/user.api'

/** Longest name the backend accepts per field. */
export const NAME_MAX_LENGTH = 100

export const GENDERS = ['male', 'female', 'other'] as const

export type Gender = (typeof GENDERS)[number]

/**
 * A member's profile. The login that points at it lives in `users`; everything
 * past the two names is optional, so the dialog can register someone from just
 * a name and an email.
 */
export const memberSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  /** Virtual: `firstName lastName`. */
  fullName: z.string(),
  dateOfBirth: z.iso.datetime().nullish(),
  gender: z.enum(GENDERS).nullish(),
  phone: z.string().nullish(),
  /** Falls back to the login email when the profile is created without one. */
  email: z.string().nullish(),
  emergencyContact: z.object({ name: z.string(), phone: z.string() }).nullish(),
  joinedAt: z.iso.datetime(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type Member = z.infer<typeof memberSchema>

const membersPageSchema = pageSchema(memberSchema)

export type MembersPage = z.infer<typeof membersPageSchema>

/** GET /api/members — staff only. Answers with `{ data, total, limit, skip }`. */
export function fetchMembers(): Promise<MembersPage> {
  return apiFetchParsed('/members', membersPageSchema)
}

/**
 * The body POST /api/members accepts. The email names the login it creates
 * alongside the profile, hence `accountEmail` — a plain `email` is the
 * optional profile field, and sending only that is rejected as incomplete.
 */
export const createMemberSchema = z.object({
  firstName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  lastName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  accountEmail: z.string().trim().toLowerCase().pipe(z.email()),
  /** Null creates an account that cannot log in until a password is set. */
  password: z.string().nullable(),
})

export type CreateMemberInput = z.input<typeof createMemberSchema>

const createdMemberSchema = z.object({
  member: memberSchema,
  user: userSchema,
})

/**
 * POST /api/members — admin only. 201 on success. Creates the profile and its
 * 'member' login in one call.
 */
export function createMember(input: CreateMemberInput) {
  return apiFetchParsed('/members', createdMemberSchema, {
    method: 'POST',
    body: JSON.stringify(createMemberSchema.parse(input)),
  })
}
