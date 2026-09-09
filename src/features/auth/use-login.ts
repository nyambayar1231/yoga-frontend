import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'
import { login } from './auth.api'
import { authKeys } from './use-session'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    // The login response already carries the user, so seed the session cache
    // rather than making the guard re-fetch /auth/me.
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.session, user)
    },
  })
}

/** Turns a failed login into a message we can show the user. */
export function loginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу.'
  }

  switch (error.status) {
    case 400:
      return 'Имэйл хаяг болон нууц үгээ бүрэн оруулна уу.'
    case 401:
      return 'Имэйл хаяг эсвэл нууц үг буруу байна.'
    case 403:
      return 'Энэ бүртгэл хаагдсан байна. Админтай холбогдоно уу.'
    default:
      return 'Серверийн алдаа гарлаа. Дараа дахин оролдоно уу.'
  }
}
