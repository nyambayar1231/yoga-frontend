import { useMutation } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'
import { login } from './auth.api'

export function useLogin() {
  return useMutation({ mutationFn: login })
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
