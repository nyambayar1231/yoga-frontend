import { useMemo } from 'react'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, ApiSchemaError } from '@/lib/api'
import type { User } from '@/features/user/user.api'
import { userKeys, usersQueryOptions } from '@/features/user/use-users'
import { createInstructor, fetchInstructors } from './instructor.api'

export const instructorKeys = {
  all: ['instructors'] as const,
  list: () => [...instructorKeys.all, 'list'] as const,
}

export const instructorsQueryOptions = queryOptions({
  queryKey: instructorKeys.list(),
  queryFn: fetchInstructors,
  select: (page) => page.data,
})

/** A teaching account, with the name its instructor profile carries. */
export interface TeachingStaff extends User {
  /** Null for an account with no instructor profile behind it. */
  fullName: string | null
}

/**
 * Everyone who may teach. An admin can hold an instructor profile too — that
 * is what lets an admin who teaches be assigned to a session — so both roles
 * belong here, and the backend takes one role per request.
 *
 * The names come from `/api/instructors`, because a login carries an email and
 * a role but no name. That lookup failing is not fatal: the row still lists the
 * account, just without a name.
 */
export function useTeachingStaff() {
  const admins = useQuery(usersQueryOptions({ role: 'admin' }))
  const instructors = useQuery(usersQueryOptions({ role: 'instructor' }))
  const profiles = useQuery(instructorsQueryOptions)

  const data = useMemo<TeachingStaff[] | undefined>(() => {
    if (!admins.data || !instructors.data) return undefined

    const nameById = new Map(profiles.data?.map((profile) => [profile.id, profile.fullName]))

    return [...admins.data, ...instructors.data]
      .map((user) => ({
        ...user,
        fullName: user.instructorId ? (nameById.get(user.instructorId) ?? null) : null,
      }))
      // Each role arrives newest-first on its own; merged they need re-sorting.
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [admins.data, instructors.data, profiles.data])

  return {
    data,
    isPending: admins.isPending || instructors.isPending,
    isError: admins.isError || instructors.isError,
  }
}

export function useCreateInstructor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInstructor,
    onSuccess: () => {
      // One call wrote both collections, so both lists are now stale.
      queryClient.invalidateQueries({ queryKey: instructorKeys.all })
      queryClient.invalidateQueries({ queryKey: userKeys.all })
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

export function createInstructorErrorMessage(error: unknown): string {
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
