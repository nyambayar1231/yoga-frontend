import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, ApiSchemaError } from '@/lib/api'
import { createStudent, fetchStudents } from './student.api'

export const studentKeys = {
  all: ['students'] as const,
  list: () => [...studentKeys.all, 'list'] as const,
}

export const studentsQueryOptions = queryOptions({
  queryKey: studentKeys.list(),
  queryFn: fetchStudents,
  // The table only needs the rows; the envelope's paging fields are the
  // backend's, and nothing renders them yet.
  select: (page) => page.data,
})

export function useStudents() {
  return useQuery(studentsQueryOptions)
}

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      // One call wrote both collections, so both lists are now stale.
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}

/** The backend's `code` is more specific than the status, so it goes first. */
const MESSAGE_BY_CODE: Record<string, string> = {
  EMAIL_IN_USE: 'Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна.',
  WEAK_PASSWORD: 'Нууц үг шаардлага хангахгүй байна.',
  VALIDATION_FAILED: 'Оруулсан мэдээлэл зөв биш байна. Талбаруудыг шалгана уу.',
  PROFILE_ALREADY_LINKED: 'Энэ сурагч аль хэдийн нэвтрэх эрхтэй байна.',
}

export function createStudentErrorMessage(error: unknown): string {
  if (error instanceof ApiSchemaError) {
    return 'Сурагч үүссэн ч серверийн хариу таарсангүй. Жагсаалтыг шинэчилж шалгана уу.'
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
      return 'Танд сурагч нэмэх эрх байхгүй.'
    default:
      return 'Серверийн алдаа гарлаа. Дараа дахин оролдоно уу.'
  }
}
