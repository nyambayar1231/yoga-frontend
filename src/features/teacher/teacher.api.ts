import { z } from 'zod'
import { apiFetchParsed, pageSchema } from '@/lib/api'

/** Longest name the backend accepts per field. */
export const NAME_MAX_LENGTH = 100

/**
 * A teacher's profile. The login that points at it lives in `users`; an admin
 * holds no teacher profile of their own, so everything here is, by
 * definition, someone who teaches.
 */
export const teacherSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  /** Virtual: `firstName lastName`. */
  fullName: z.string(),
  phone: z.string().nullish(),
  bio: z.string().nullish(),
  /** What they teach: 'mathematics', 'physics', ... */
  subjects: z.array(z.string()).default([]),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type Teacher = z.infer<typeof teacherSchema>

const teachersPageSchema = pageSchema(teacherSchema)

export type TeachersPage = z.infer<typeof teachersPageSchema>

/** GET /api/teachers — any signed-in user may read these. */
export function fetchTeachers(): Promise<TeachersPage> {
  return apiFetchParsed('/teachers', teachersPageSchema)
}

/**
 * The body POST /api/teachers accepts. The email belongs to the login it
 * creates alongside the profile, hence `accountEmail` rather than `email`.
 */
export const createTeacherSchema = z.object({
  firstName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  lastName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  accountEmail: z.string().trim().toLowerCase().pipe(z.email()),
  /** Null creates an account that cannot log in until a password is set. */
  password: z.string().nullable(),
})

export type CreateTeacherInput = z.input<typeof createTeacherSchema>

/**
 * The login POST /api/teachers creates alongside the profile. Kept local
 * rather than sharing `userSchema`: that schema still describes the old
 * yoga-studio roles ('instructor', 'member'), which the backend's
 * admin/teacher/student model no longer returns.
 */
const teacherAccountSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.literal('teacher'),
  isActive: z.boolean(),
  teacherId: z.string().nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

const createdTeacherSchema = z.object({
  teacher: teacherSchema,
  user: teacherAccountSchema,
})

/**
 * POST /api/teachers — admin only. 201 on success. Creates the profile and
 * its 'teacher' login in one call.
 */
export function createTeacher(input: CreateTeacherInput) {
  return apiFetchParsed('/teachers', createdTeacherSchema, {
    method: 'POST',
    body: JSON.stringify(createTeacherSchema.parse(input)),
  })
}
