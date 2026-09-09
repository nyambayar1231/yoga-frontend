import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, ApiSchemaError } from '@/lib/api'
import { createClassType, fetchClassTypes } from './class-type.api'

export const classTypeKeys = {
  all: ['class-types'] as const,
  list: () => [...classTypeKeys.all, 'list'] as const,
}

export const classTypesQueryOptions = queryOptions({
  queryKey: classTypeKeys.list(),
  queryFn: fetchClassTypes,
  // The table only needs the rows; the envelope's paging fields are the
  // backend's, and nothing renders them yet.
  select: (page) => page.data,
})

export function useClassTypes() {
  return useQuery(classTypesQueryOptions)
}

export function useCreateClassType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createClassType,
    onSuccess: () => {
      // The new class type has to show up in the table.
      queryClient.invalidateQueries({ queryKey: classTypeKeys.all })
    },
  })
}

const CATEGORY_LABELS: Record<string, string> = {
  yoga: 'йог',
  pilates: 'пилатес',
  other: 'бусад',
}

/** Falls back to the raw category so a new backend value is visible, not blank. */
export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

/** The backend's `code` is more specific than the status, so it goes first. */
const MESSAGE_BY_CODE: Record<string, string> = {
  CLASS_TYPE_EXISTS: 'Ийм нэртэй хичээл аль хэдийн бүртгэгдсэн байна.',
  VALIDATION_FAILED: 'Оруулсан мэдээлэл зөв биш байна. Талбаруудыг шалгана уу.',
}

export function createClassTypeErrorMessage(error: unknown): string {
  if (error instanceof ApiSchemaError) {
    return 'Хичээл үүссэн ч серверийн хариу таарсангүй. Жагсаалтыг шинэчилж шалгана уу.'
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
      return 'Танд хичээлийн төрөл нэмэх эрх байхгүй.'
    default:
      return 'Серверийн алдаа гарлаа. Дараа дахин оролдоно уу.'
  }
}
