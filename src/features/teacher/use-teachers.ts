import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, ApiSchemaError } from '@/lib/api'
import { createTeacher, fetchTeachers } from './teacher.api'

export const teacherKeys = {
  all: ['teachers'] as const,
  list: () => [...teacherKeys.all, 'list'] as const,
}

export const teachersQueryOptions = queryOptions({
  queryKey: teacherKeys.list(),
  queryFn: fetchTeachers,
  // The table only needs the rows; the envelope's paging fields are the
  // backend's, and nothing renders them yet.
  select: (page) => page.data,
})

/**
 * Everyone with a teacher profile. An admin holds no teacher profile of their
 * own — administration is not teaching — so, unlike the old yoga-studio
 * instructor list, this needs no merge with `/api/users`.
 */
export function useTeachers() {
  return useQuery(teachersQueryOptions)
}

export function useCreateTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
    },
  })
}

/** The backend's `code` is more specific than the status, so it goes first. */
const MESSAGE_BY_CODE: Record<string, string> = {
  EMAIL_IN_USE: 'Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна.',
  WEAK_PASSWORD: 'Нууц үг шаардлага хангахгүй байна.',
  VALIDATION_FAILED: 'Оруулсан мэдээлэл зөв биш байна. Талбаруудыг шалгана уу.',
  PROFILE_ALREADY_LINKED: 'Энэ багш аль хэдийн нэвтрэх эрхтэй байна.',
}

export function createTeacherErrorMessage(error: unknown): string {
  if (error instanceof ApiSchemaError) {
    return 'Багш үүссэн ч серверийн хариу таарсангүй. Жагсаалтыг шинэчилж шалгана уу.'
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
      return 'Танд багш нэмэх эрх байхгүй.'
    default:
      return 'Серверийн алдаа гарлаа. Дараа дахин оролдоно уу.'
  }
}
