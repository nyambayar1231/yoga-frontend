import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, ApiSchemaError } from '@/lib/api'
import {
  enrollStudent,
  fetchClassRoster,
  unenrollStudent,
  type EnrollStudentInput,
} from './enrollment.api'

export const rosterKeys = {
  all: ['class-roster'] as const,
  list: (classId: string) => [...rosterKeys.all, classId] as const,
}

export function classRosterQueryOptions(classId: string) {
  return queryOptions({
    queryKey: rosterKeys.list(classId),
    queryFn: () => fetchClassRoster(classId),
    // The table only needs the rows; the envelope's paging fields are the
    // backend's, and nothing renders them yet.
    select: (page) => page.data,
  })
}

export function useClassRoster(classId: string) {
  return useQuery(classRosterQueryOptions(classId))
}

export function useEnrollStudent(classId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: EnrollStudentInput) => enrollStudent(classId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rosterKeys.list(classId) })
    },
  })
}

export function useUnenrollStudent(classId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unenrollStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rosterKeys.list(classId) })
    },
  })
}

/** The backend's `code` is more specific than the status, so it goes first. */
const MESSAGE_BY_CODE: Record<string, string> = {
  STUDENT_NOT_FOUND: 'Ийм сурагч олдсонгүй.',
  CLASS_NOT_FOUND: 'Ийм анги олдсонгүй.',
  ALREADY_ENROLLED: 'Энэ сурагч өөр ангид эсвэл энэ ангид аль хэдийн элссэн байна.',
  VALIDATION_FAILED: 'Оруулсан мэдээлэл зөв биш байна. Талбаруудыг шалгана уу.',
}

export function enrollErrorMessage(error: unknown): string {
  if (error instanceof ApiSchemaError) {
    return 'Элсүүлсэн ч серверийн хариу таарсангүй. Жагсаалтыг шинэчилж шалгана уу.'
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
      return 'Танд сурагч элсүүлэх эрх байхгүй.'
    default:
      return 'Серверийн алдаа гарлаа. Дараа дахин оролдоно уу.'
  }
}
