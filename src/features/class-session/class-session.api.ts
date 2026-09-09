import { z } from 'zod'
import { apiFetchParsed, pageSchema } from '@/lib/api'
import { CLASS_CATEGORIES } from '@/features/class-type/class-type.api'

export const CAPACITY_MIN = 1
export const CAPACITY_MAX = 500

export const SESSION_STATUSES = ['scheduled', 'cancelled', 'completed'] as const

export type SessionStatus = (typeof SESSION_STATUSES)[number]

/** Fields every session carries, however its references are serialised. */
const sessionBase = {
  id: z.string(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  /** Copied from the class type at creation, so editing the catalogue later
   *  cannot resize a class people have already booked. */
  capacity: z.number(),
  status: z.enum(SESSION_STATUSES),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}

/**
 * A session as POST returns it. `ClassSession.create()` does not populate, so
 * the references come back as plain ids here — unlike the list below.
 */
export const classSessionSchema = z.object({
  ...sessionBase,
  classTypeId: z.string(),
  instructorId: z.string(),
})

export type ClassSession = z.infer<typeof classSessionSchema>

/**
 * A session as the timetable returns it. The list populates both references,
 * so no second query is needed to show names.
 */
export const classSessionListItemSchema = z.object({
  ...sessionBase,
  classTypeId: z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(CLASS_CATEGORIES),
    durationMinutes: z.number(),
  }),
  instructorId: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    /** Virtual: `firstName lastName`. */
    fullName: z.string(),
  }),
})

export type ClassSessionListItem = z.infer<typeof classSessionListItemSchema>

const classSessionsPageSchema = pageSchema(classSessionListItemSchema)

export type ClassSessionsPage = z.infer<typeof classSessionsPageSchema>

/** GET /api/class-sessions — readable by anyone signed in, sorted by start time. */
export function fetchClassSessions(): Promise<ClassSessionsPage> {
  return apiFetchParsed('/class-sessions', classSessionsPageSchema)
}

/**
 * The body POST /api/class-sessions accepts. `endAt` and `capacity` are left
 * out on purpose: the backend derives them from the class type, which is the
 * whole point of keeping the catalogue separate from the timetable.
 */
export const createClassSessionSchema = z.object({
  classTypeId: z.string().min(1),
  instructorId: z.string().min(1),
  /** ISO 8601. The backend stores UTC and the studio's timezone is applied for display. */
  startAt: z.iso.datetime(),
})

export type CreateClassSessionInput = z.input<typeof createClassSessionSchema>

/** POST /api/class-sessions — admin only. 201 with the unpopulated session. */
export function createClassSession(input: CreateClassSessionInput): Promise<ClassSession> {
  return apiFetchParsed('/class-sessions', classSessionSchema, {
    method: 'POST',
    body: JSON.stringify(createClassSessionSchema.parse(input)),
  })
}
