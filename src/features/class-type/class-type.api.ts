import { z } from 'zod'
import { apiFetchParsed, pageSchema } from '@/lib/api'

/** Bounds the backend enforces, mirrored so the form can fail early. */
export const NAME_MAX_LENGTH = 150
export const DESCRIPTION_MAX_LENGTH = 2000
export const DURATION_MIN_MINUTES = 5
export const DURATION_MAX_MINUTES = 600
export const CAPACITY_MIN = 1
export const CAPACITY_MAX = 500

export const CLASS_CATEGORIES = ['yoga', 'pilates', 'other'] as const

export type ClassCategory = (typeof CLASS_CATEGORIES)[number]

/**
 * What a class is, never when it runs. "Yoga 101" is one class type however
 * many times a week it is scheduled — the occurrences are class sessions.
 */
export const classTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  category: z.enum(CLASS_CATEGORIES),
  durationMinutes: z.number(),
  /** The default a session inherits; a session may then be resized on its own. */
  capacity: z.number(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type ClassType = z.infer<typeof classTypeSchema>

const classTypesPageSchema = pageSchema(classTypeSchema)

export type ClassTypesPage = z.infer<typeof classTypesPageSchema>

/** GET /api/class-types — readable by anyone signed in. */
export function fetchClassTypes(): Promise<ClassTypesPage> {
  return apiFetchParsed('/class-types', classTypesPageSchema)
}

/** The body POST /api/class-types accepts. Times and dates belong to sessions. */
export const createClassTypeSchema = z.object({
  name: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH).optional(),
  category: z.enum(CLASS_CATEGORIES),
  durationMinutes: z.number().int().min(DURATION_MIN_MINUTES).max(DURATION_MAX_MINUTES),
  capacity: z.number().int().min(CAPACITY_MIN).max(CAPACITY_MAX),
})

export type CreateClassTypeInput = z.input<typeof createClassTypeSchema>

/** POST /api/class-types — admin only. 201 with the created class type. */
export function createClassType(input: CreateClassTypeInput): Promise<ClassType> {
  return apiFetchParsed('/class-types', classTypeSchema, {
    method: 'POST',
    body: JSON.stringify(createClassTypeSchema.parse(input)),
  })
}
