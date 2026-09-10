import { z } from 'zod'
import { apiFetchParsed, pageSchema } from '@/lib/api'

/** A school year, written as the two calendar years it spans: '2026-2027'. */
export const SCHOOL_YEAR_PATTERN = /^\d{4}-\d{4}$/

/**
 * One row of a class roster: the enrolment with its student resolved.
 * `classId` stays a bare id — the caller already knows which class this is,
 * it came from the URL.
 */
export const rosterEntrySchema = z.object({
  id: z.string(),
  studentId: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    /** Virtual: `firstName lastName`. */
    fullName: z.string(),
    email: z.string().nullish(),
    isActive: z.boolean(),
  }),
  classId: z.string(),
  schoolYear: z.string(),
  enrolledAt: z.iso.datetime(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type RosterEntry = z.infer<typeof rosterEntrySchema>

const rosterPageSchema = pageSchema(rosterEntrySchema)

export type RosterPage = z.infer<typeof rosterPageSchema>

/**
 * GET /api/classes/:id/students — staff only (admin or teacher). Defaults to
 * who is in the class now, not everyone who has ever been through it.
 */
export function fetchClassRoster(classId: string): Promise<RosterPage> {
  return apiFetchParsed(`/classes/${classId}/students`, rosterPageSchema)
}

/** The body POST /api/classes/:id/students accepts. */
export const enrollStudentSchema = z.object({
  studentId: z.string().min(1),
  schoolYear: z.string().trim().regex(SCHOOL_YEAR_PATTERN),
})

export type EnrollStudentInput = z.input<typeof enrollStudentSchema>

/** The enrolment as POST/DELETE return it — unpopulated, unlike the roster above. */
const enrollmentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  classId: z.string(),
  schoolYear: z.string(),
  enrolledAt: z.iso.datetime(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type Enrollment = z.infer<typeof enrollmentSchema>

/** POST /api/classes/:id/students — admin only. 201 with the unpopulated enrolment. */
export function enrollStudent(classId: string, input: EnrollStudentInput): Promise<Enrollment> {
  return apiFetchParsed(`/classes/${classId}/students`, enrollmentSchema, {
    method: 'POST',
    body: JSON.stringify(enrollStudentSchema.parse(input)),
  })
}

/**
 * DELETE /api/enrollments/:id — admin only. Deactivation, not deletion: the
 * row stays as the record of where the student used to be.
 */
export function unenrollStudent(enrollmentId: string): Promise<Enrollment> {
  return apiFetchParsed(`/enrollments/${enrollmentId}`, enrollmentSchema, {
    method: 'DELETE',
  })
}
