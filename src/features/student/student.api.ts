import { z } from 'zod'
import { apiFetchParsed, pageSchema } from '@/lib/api'

/** Longest name the backend accepts per field. */
export const NAME_MAX_LENGTH = 100

export const GENDERS = ['male', 'female', 'other'] as const

export type Gender = (typeof GENDERS)[number]

/**
 * A student's profile. The login that points at it lives in `users`. Which
 * class they are in is not stored here — that is a row in `enrollments` — so
 * a profile outlives every class the student has ever been through.
 */
export const studentSchema = z.object({
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
  guardian: z
    .object({ name: z.string(), phone: z.string(), relation: z.string().nullish() })
    .nullish(),
  enrolledAt: z.iso.datetime(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type Student = z.infer<typeof studentSchema>

const studentsPageSchema = pageSchema(studentSchema)

export type StudentsPage = z.infer<typeof studentsPageSchema>

/** GET /api/students — staff only (admin or teacher). */
export function fetchStudents(): Promise<StudentsPage> {
  return apiFetchParsed('/students', studentsPageSchema)
}

/**
 * The body POST /api/students accepts. The email names the login it creates
 * alongside the profile, hence `accountEmail` — a plain `email` is the
 * optional profile field, and sending only that is rejected as incomplete.
 */
export const createStudentSchema = z.object({
  firstName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  lastName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  accountEmail: z.string().trim().toLowerCase().pipe(z.email()),
  /** Null creates an account that cannot log in until a password is set. */
  password: z.string().nullable(),
})

export type CreateStudentInput = z.input<typeof createStudentSchema>

/**
 * The login POST /api/students creates alongside the profile. Kept local
 * rather than sharing `userSchema`: that schema described the old
 * yoga-studio roles until recently, and student-specific consumers should
 * not depend on it drifting again.
 */
const studentAccountSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.literal('student'),
  isActive: z.boolean(),
  studentId: z.string().nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

const createdStudentSchema = z.object({
  student: studentSchema,
  user: studentAccountSchema,
})

/**
 * POST /api/students — admin only. 201 on success. Creates the profile and
 * its 'student' login in one call.
 */
export function createStudent(input: CreateStudentInput) {
  return apiFetchParsed('/students', createdStudentSchema, {
    method: 'POST',
    body: JSON.stringify(createStudentSchema.parse(input)),
  })
}
