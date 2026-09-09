import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, ApiSchemaError } from '@/lib/api'
import { userKeys } from '@/features/user/use-users'
import { createMember, fetchMembers } from './member.api'

export const memberKeys = {
  all: ['members'] as const,
  list: () => [...memberKeys.all, 'list'] as const,
}

export const membersQueryOptions = queryOptions({
  queryKey: memberKeys.list(),
  queryFn: fetchMembers,
  // The table only needs the rows; the envelope's paging fields are the
  // backend's, and nothing renders them yet.
  select: (page) => page.data,
})

export function useMembers() {
  return useQuery(membersQueryOptions)
}

export function useCreateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      // One call wrote both collections, so both lists are now stale.
      queryClient.invalidateQueries({ queryKey: memberKeys.all })
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

/** The backend's `code` is more specific than the status, so it goes first. */
const MESSAGE_BY_CODE: Record<string, string> = {
  EMAIL_IN_USE: 'Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна.',
  WEAK_PASSWORD: 'Нууц үг шаардлага хангахгүй байна.',
  VALIDATION_FAILED: 'Оруулсан мэдээлэл зөв биш байна. Талбаруудыг шалгана уу.',
  PROFILE_ALREADY_LINKED: 'Энэ гишүүн аль хэдийн нэвтрэх эрхтэй байна.',
}

export function createMemberErrorMessage(error: unknown): string {
  if (error instanceof ApiSchemaError) {
    return 'Гишүүн үүссэн ч серверийн хариу таарсангүй. Жагсаалтыг шинэчилж шалгана уу.'
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
      return 'Танд гишүүн нэмэх эрх байхгүй.'
    default:
      return 'Серверийн алдаа гарлаа. Дараа дахин оролдоно уу.'
  }
}
