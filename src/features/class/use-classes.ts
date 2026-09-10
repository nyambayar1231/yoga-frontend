import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, ApiSchemaError } from '@/lib/api'
import { createClass, fetchClassById, fetchClasses } from './class.api'

export const classKeys = {
  all: ['classes'] as const,
  list: () => [...classKeys.all, 'list'] as const,
  detail: (id: string) => [...classKeys.all, 'detail', id] as const,
}

export const classesQueryOptions = queryOptions({
  queryKey: classKeys.list(),
  queryFn: fetchClasses,
  // The table only needs the rows; the envelope's paging fields are the
  // backend's, and nothing renders them yet.
  select: (page) => page.data,
})

export function useClasses() {
  return useQuery(classesQueryOptions)
}

export function useClass(id: string) {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => fetchClassById(id),
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      // The new class has to show up in the table.
      queryClient.invalidateQueries({ queryKey: classKeys.all })
    },
  })
}

/** The backend's `code` is more specific than the status, so it goes first. */
const MESSAGE_BY_CODE: Record<string, string> = {
  CLASS_EXISTS: 'Ийм анги аль хэдийн бүртгэгдсэн байна.',
  VALIDATION_FAILED: 'Оруулсан мэдээлэл зөв биш байна. Талбаруудыг шалгана уу.',
}

export function createClassErrorMessage(error: unknown): string {
  if (error instanceof ApiSchemaError) {
    return 'Анги үүссэн ч серверийн хариу таарсангүй. Жагсаалтыг шинэчилж шалгана уу.'
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
      return 'Танд анги нэмэх эрх байхгүй.'
    default:
      return 'Серверийн алдаа гарлаа. Дараа дахин оролдоно уу.'
  }
}
