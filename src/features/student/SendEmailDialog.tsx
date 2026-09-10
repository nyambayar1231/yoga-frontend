import { useState } from 'react'
import type { FormEvent } from 'react'
import { z } from 'zod'
import {
  EMAIL_SUBJECT_MAX_LENGTH,
  EMAIL_TEXT_MAX_LENGTH,
} from '@/features/user/user.api'
import {
  sendUserEmailErrorMessage,
  useSendUserEmail,
} from '@/features/user/use-send-user-email'
import { useStudentAccount } from '@/features/user/use-users'
import type { Student } from './student.api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/**
 * What POST /api/users/:id/email accepts, checked before the round-trip. The
 * backend defaults a missing subject, but a message sent from here should say
 * what it is about, so we ask for one.
 */
const formSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, 'Гарчиг оруулна уу.')
    .max(EMAIL_SUBJECT_MAX_LENGTH, `Гарчиг ${EMAIL_SUBJECT_MAX_LENGTH} тэмдэгтээс хэтрэхгүй байх.`),
  text: z
    .string()
    .trim()
    .min(1, 'Агуулга оруулна уу.')
    .max(EMAIL_TEXT_MAX_LENGTH, `Агуулга ${EMAIL_TEXT_MAX_LENGTH} тэмдэгтээс хэтрэхгүй байх.`),
})

type FormField = keyof z.infer<typeof formSchema>

interface FormError {
  field?: FormField
  message: string
}

interface SendEmailDialogProps {
  /** Null while the dialog has never been opened; kept during the close animation. */
  student: Student | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Composes and sends one email to a student. The address is the account's, not
 * the profile's: the backend emails the login, and only it knows where that is.
 */
function SendEmailDialog({ student, open, onOpenChange }: SendEmailDialogProps) {
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [formError, setFormError] = useState<FormError | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  // A profile does not know its login, so the account is looked up on open.
  const account = useStudentAccount(student?.id ?? null, open)
  const sendEmail = useSendUserEmail(account.data?.id ?? null)

  /** A stale message should not outlive the edit that follows it. */
  function clearFeedback() {
    if (formError) setFormError(null)
    if (sentTo) setSentTo(null)
    if (sendEmail.error) sendEmail.reset()
  }

  // A draft belongs to the student it was written for, not to the next one.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setSubject('')
      setText('')
      setFormError(null)
      setSentTo(null)
      sendEmail.reset()
    }
    onOpenChange(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = formSchema.safeParse({ subject, text })
    if (!result.success) {
      // One message at a time, flagging the field it belongs to.
      const [issue] = result.error.issues
      setFormError({ field: issue.path[0] as FormField, message: issue.message })
      return
    }

    setFormError(null)
    setSentTo(null)
    sendEmail.mutate(result.data, {
      onSuccess: (message) => {
        // The dialog stays open: the address it went to is the receipt, and
        // there is no record of the message anywhere else.
        setSubject('')
        setText('')
        setSentTo(message.to)
      },
    })
  }

  const serverError: FormError | null = sendEmail.error
    ? { message: sendUserEmailErrorMessage(sendEmail.error) }
    : null

  // A student with no login has nowhere to receive mail, and the endpoint is
  // addressed by account id, so there is nothing to send to.
  const missingAccount = account.isSuccess && account.data === null

  const error =
    formError ??
    serverError ??
    (account.isError ? { message: 'Нэвтрэх эрхийг татаж чадсангүй.' } : null) ??
    (missingAccount ? { message: 'Энэ сурагч нэвтрэх эрхгүй тул имэйл илгээх боломжгүй.' } : null)

  const recipient = account.data?.email ?? ''
  const disabled = sendEmail.isPending || account.isPending || missingAccount

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Имэйл илгээх</DialogTitle>
          <DialogDescription>
            {student ? `${student.fullName}-д имэйл бичих.` : 'Сурагчид имэйл бичих.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="student-email-to">Хүлээн авагч</Label>
            <Input
              id="student-email-to"
              readOnly
              value={recipient}
              placeholder={account.isPending ? 'Уншиж байна…' : 'Имэйл хаяг олдсонгүй'}
              className="h-9 text-muted-foreground"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="student-email-subject">Гарчиг</Label>
            <Input
              id="student-email-subject"
              autoComplete="off"
              placeholder="Хичээлийн мэдээлэл"
              maxLength={EMAIL_SUBJECT_MAX_LENGTH}
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value)
                clearFeedback()
              }}
              disabled={disabled}
              aria-invalid={error?.field === 'subject'}
              className="h-9"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="student-email-body">Агуулга</Label>
            <Textarea
              id="student-email-body"
              rows={6}
              placeholder="Сайн байна уу…"
              maxLength={EMAIL_TEXT_MAX_LENGTH}
              value={text}
              onChange={(event) => {
                setText(event.target.value)
                clearFeedback()
              }}
              disabled={disabled}
              aria-invalid={error?.field === 'text'}
            />
          </div>

          {error ? (
            <p role="alert" className="text-xs/relaxed text-destructive">
              {error.message}
            </p>
          ) : sentTo ? (
            <p role="status" className="text-xs/relaxed text-muted-foreground">
              {sentTo} хаяг руу илгээлээ.
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => handleOpenChange(false)}
              disabled={sendEmail.isPending}
            >
              Хаах
            </Button>
            <Button type="submit" size="lg" disabled={disabled}>
              {sendEmail.isPending ? 'Илгээж байна…' : 'Илгээх'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SendEmailDialog
