import { z } from 'zod'
import { apiFetchParsed, pageSchema } from '@/lib/api'
import { userSchema } from '@/features/user/user.api'

/** Longest name the backend accepts per field. */
export const NAME_MAX_LENGTH = 100

/**
 * An instructor's profile. The login that points at it lives in `users`, which
 * is where the email and the role are — a profile carries neither.
 */
export const instructorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  /** Virtual: `firstName lastName`. */
  fullName: z.string(),
  phone: z.string().nullish(),
  bio: z.string().nullish(),
  specialties: z.array(z.string()).default([]),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type Instructor = z.infer<typeof instructorSchema>

const instructorsPageSchema = pageSchema(instructorSchema)

export type InstructorsPage = z.infer<typeof instructorsPageSchema>

/** GET /api/instructors — any signed-in user may read these. */
export function fetchInstructors(): Promise<InstructorsPage> {
  return apiFetchParsed('/instructors', instructorsPageSchema)
}

/**
 * The body POST /api/instructors accepts. The email belongs to the login it
 * creates alongside the profile, hence `accountEmail` rather than `email`.
 */
export const createInstructorSchema = z.object({
  firstName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  lastName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  accountEmail: z.string().trim().toLowerCase().pipe(z.email()),
  /** Null creates an account that cannot log in until a password is set. */
  password: z.string().nullable(),
})

export type CreateInstructorInput = z.input<typeof createInstructorSchema>

const createdInstructorSchema = z.object({
  instructor: instructorSchema,
  user: userSchema,
})

/**
 * POST /api/instructors — admin only. 201 on success. Creates the profile and
 * its 'instructor' login in one call, which is why adding a teacher goes here
 * rather than through POST /api/users.
 */
export function createInstructor(input: CreateInstructorInput) {
  return apiFetchParsed('/instructors', createdInstructorSchema, {
    method: 'POST',
    body: JSON.stringify(createInstructorSchema.parse(input)),
  })
}
