import { z } from 'zod'
import { apiFetchParsed, pageSchema } from '@/lib/api'

/** Grades the school runs. */
export const MIN_GRADE = 1
export const MAX_GRADE = 5

export const GRADES: readonly number[] = Array.from(
  { length: MAX_GRADE - MIN_GRADE + 1 },
  (_unused, index) => MIN_GRADE + index,
)

export const CLASS_SECTIONS = ['a', 'b'] as const

export type ClassSection = (typeof CLASS_SECTIONS)[number]

/**
 * A class group — grade 1 section A, and so on. It is the group itself, not a
 * lesson: who is in it is a row per student in `enrollments`, not a field
 * here.
 */
export const schoolClassSchema = z.object({
  id: z.string(),
  grade: z.number(),
  section: z.enum(CLASS_SECTIONS),
  /** Derived from grade and section, e.g. '1a'. */
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type SchoolClass = z.infer<typeof schoolClassSchema>

const classesPageSchema = pageSchema(schoolClassSchema)

export type ClassesPage = z.infer<typeof classesPageSchema>

/** GET /api/classes — readable by anyone signed in. */
export function fetchClasses(): Promise<ClassesPage> {
  return apiFetchParsed('/classes', classesPageSchema)
}

/** GET /api/classes/:id — readable by anyone signed in. */
export function fetchClassById(id: string): Promise<SchoolClass> {
  return apiFetchParsed(`/classes/${id}`, schoolClassSchema)
}

/** The body POST /api/classes accepts. */
export const createClassSchema = z.object({
  grade: z.coerce.number().int().min(MIN_GRADE).max(MAX_GRADE),
  section: z.enum(CLASS_SECTIONS),
})

export type CreateClassInput = z.input<typeof createClassSchema>

/** POST /api/classes — admin only. 201 with the created class. */
export function createClass(input: CreateClassInput): Promise<SchoolClass> {
  return apiFetchParsed('/classes', schoolClassSchema, {
    method: 'POST',
    body: JSON.stringify(createClassSchema.parse(input)),
  })
}
