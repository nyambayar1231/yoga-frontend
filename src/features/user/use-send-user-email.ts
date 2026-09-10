import { useMutation } from '@tanstack/react-query'
import { ApiError, ApiSchemaError } from '@/lib/api'
import { sendUserEmail, type SendUserEmailInput } from './user.api'

/**
 * Sends one email to an account. Nothing is cached to invalidate — the backend
 * keeps no record of the message, so the response is the only trace of it.
 */
export function useSendUserEmail(userId: string | null) {
  return useMutation({
    mutationFn: (input: SendUserEmailInput) => {
      if (userId === null) throw new Error('No account to email')
      return sendUserEmail(userId, input)
    },
  })
}

/** The backend's `code` is more specific than the status, so it goes first. */
const MESSAGE_BY_CODE: Record<string, string> = {
  USER_NOT_FOUND: 'Энэ хүний нэвтрэх эрх олдсонгүй.',
  INVALID_EMAIL: 'Бүртгэлийн имэйл хаяг буруу байна.',
  NOT_CONFIGURED: 'Имэйл илгээх тохиргоо серверт хийгдээгүй байна.',
  SEND_FAILED: 'Имэйл илгээгчтэй холбогдож чадсангүй. Дараа дахин оролдоно уу.',
  VALIDATION_FAILED: 'Гарчиг болон агуулгыг шалгана уу.',
}

export function sendUserEmailErrorMessage(error: unknown): string {
  if (error instanceof ApiSchemaError) {
    return 'Имэйл илгээгдсэн ч серверийн хариу таарсангүй.'
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
      return 'Танд имэйл илгээх эрх байхгүй.'
    default:
      return 'Серверийн алдаа гарлаа. Дараа дахин оролдоно уу.'
  }
}
