import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, ApiSchemaError } from '@/lib/api'
import { createClassSession, fetchClassSessions } from './class-session.api'

export const classSessionKeys = {
  all: ['class-sessions'] as const,
  list: () => [...classSessionKeys.all, 'list'] as const,
}

export const classSessionsQueryOptions = queryOptions({
  queryKey: classSessionKeys.list(),
  queryFn: fetchClassSessions,
  // The table only needs the rows; the envelope's paging fields are the
  // backend's, and nothing renders them yet.
  select: (page) => page.data,
})

export function useClassSessions() {
  return useQuery(classSessionsQueryOptions)
}

export function useCreateClassSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createClassSession,
    onSuccess: () => {
      // The new session has to show up on the timetable.
      queryClient.invalidateQueries({ queryKey: classSessionKeys.all })
    },
  })
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'товлосон',
  cancelled: 'цуцлагдсан',
  completed: 'дууссан',
}

/** Falls back to the raw status so a new backend value is visible, not blank. */
export function sessionStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

/** The backend's `code` is more specific than the status, so it goes first. */
const MESSAGE_BY_CODE: Record<string, string> = {
  INSTRUCTOR_DOUBLE_BOOKED: 'Тухайн багш энэ цагт өөр хичээл заахаар товлогдсон байна.',
  CLASS_TYPE_INACTIVE: 'Сонгосон хичээл идэвхгүй байна.',
  INSTRUCTOR_INACTIVE: 'Сонгосон багш идэвхгүй байна.',
  INVALID_TIME_RANGE: 'Дуусах цаг нь эхлэх цагаас хойш байх ёстой.',
  CLASS_TYPE_NOT_FOUND: 'Сонгосон хичээл олдсонгүй.',
  INSTRUCTOR_NOT_FOUND: 'Сонгосон багш олдсонгүй.',
  VALIDATION_FAILED: 'Оруулсан мэдээлэл зөв биш байна. Талбаруудыг шалгана уу.',
}

export function createClassSessionErrorMessage(error: unknown): string {
  if (error instanceof ApiSchemaError) {
    return 'Хичээл товлогдсон ч серверийн хариу таарсангүй. Хуваарийг шинэчилж шалгана уу.'
  }
  if (!(error instanceof ApiError)) {
    return 'Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу.'
  }

  const byCode = MESSAGE_BY_CODE[error.code]
  if (byCode) return byCode

  switch (error.status) {
    case 400:
      return 'Оруулсан мэдээлэл зөв биш байна. Талбаруудыг шалгана уу.'
    case 401:
      return 'Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.'
    case 403:
      return 'Танд хичээл товлох эрх байхгүй.'
    default:
      return 'Серверийн алдаа гарлаа. Дараа дахин оролдоно уу.'
  }
}
