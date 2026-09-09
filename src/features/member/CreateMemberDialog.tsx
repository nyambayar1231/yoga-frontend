import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { z } from 'zod'
import { ApiError } from '@/lib/api'
import {
  EMAIL_RE,
  isPasswordTooLong,
  passwordProblems,
} from '@/lib/password'
import { NAME_MAX_LENGTH } from './member.api'
import { createMemberErrorMessage, useCreateMember } from './use-members'
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

/** Both names are required and capped at 100 characters by the backend. */
function nameField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} оруулна уу.`)
    .max(NAME_MAX_LENGTH, `${label} ${NAME_MAX_LENGTH} тэмдэгтээс хэтрэхгүй байх.`)
}

/**
 * What POST /api/members accepts, checked before the round-trip so a typo does
 * not cost one. The rules mirror the backend's; the wording is ours.
 */
const formSchema = z.object({
  firstName: nameField('Нэр'),
  lastName: nameField('Овог'),
  accountEmail: z.string().trim().regex(EMAIL_RE, 'Зөв имэйл хаяг оруулна уу.'),
  password: z
    .string()
    .superRefine((password, ctx) => {
      // Optional: an account with no password simply cannot log in yet.
      if (password === '') return

      const problems = passwordProblems(password)
      if (problems.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: `Нууц үг ${problems.join(', ')} агуулсан байх шаардлагатай.`,
        })
        return
      }
      if (isPasswordTooLong(password)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Нууц үг хэт урт байна (дээд тал нь 72 байт).',
        })
      }
    })
    // The backend wants an explicit null for "no password yet".
    .transform((password) => (password === '' ? null : password)),
})

type FormField = keyof z.infer<typeof formSchema>

/** Which field the backend's rejection belongs to, when its code names one. */
const FIELD_BY_CODE: Record<string, FormField> = {
  EMAIL_IN_USE: 'accountEmail',
  WEAK_PASSWORD: 'password',
}

interface FormError {
  field?: FormField
  message: string
}

interface CreateMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CreateMemberDialog({ open, onOpenChange }: CreateMemberDialogProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  // Which field to flag, so a bad email does not mark the password invalid too.
  const [formError, setFormError] = useState<FormError | null>(null)

  const createMember = useCreateMember()

  /** Stale red borders should not outlive the edit that fixes them. */
  function clearErrors() {
    if (formError) setFormError(null)
    if (createMember.error) createMember.reset()
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setFirstName('')
      setLastName('')
      setAccountEmail('')
      setPassword('')
      setShowPassword(false)
      setFormError(null)
      createMember.reset()
    }
    onOpenChange(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = formSchema.safeParse({ firstName, lastName, accountEmail, password })
    if (!result.success) {
      // One message at a time, flagging the field it belongs to.
      const [issue] = result.error.issues
      setFormError({ field: issue.path[0] as FormField, message: issue.message })
      return
    }

    setFormError(null)
    createMember.mutate(result.data, { onSuccess: () => handleOpenChange(false) })
  }

  const serverError: FormError | null = createMember.error
    ? {
        field:
          createMember.error instanceof ApiError
            ? FIELD_BY_CODE[createMember.error.code]
            : undefined,
        message: createMemberErrorMessage(createMember.error),
      }
    : null

  const error = formError ?? serverError

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Гишүүн нэмэх</DialogTitle>
          <DialogDescription>
            Шинэ гишүүний мэдээллийг оруулна уу.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-member-first-name">Нэр</Label>
            <Input
              id="new-member-first-name"
              autoComplete="off"
              placeholder="Оюунаа"
              maxLength={NAME_MAX_LENGTH}
              value={firstName}
              onChange={(event) => {
                setFirstName(event.target.value)
                clearErrors()
              }}
              disabled={createMember.isPending}
              aria-invalid={error?.field === 'firstName'}
              className="h-9"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-member-last-name">Овог</Label>
            <Input
              id="new-member-last-name"
              autoComplete="off"
              placeholder="Батбаяр"
              maxLength={NAME_MAX_LENGTH}
              value={lastName}
              onChange={(event) => {
                setLastName(event.target.value)
                clearErrors()
              }}
              disabled={createMember.isPending}
              aria-invalid={error?.field === 'lastName'}
              className="h-9"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-member-email">Имэйл хаяг</Label>
            <Input
              id="new-member-email"
              type="email"
              autoComplete="off"
              placeholder="oyunaa@mail.mn"
              value={accountEmail}
              onChange={(event) => {
                setAccountEmail(event.target.value)
                clearErrors()
              }}
              disabled={createMember.isPending}
              aria-invalid={error?.field === 'accountEmail'}
              className="h-9"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="new-member-password">Нууц үг</Label>
              <span className="text-[0.625rem]/relaxed text-muted-foreground">
                Заавал биш
              </span>
            </div>
            <div className="relative">
              <Input
                id="new-member-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  clearErrors()
                }}
                disabled={createMember.isPending}
                aria-invalid={error?.field === 'password'}
                aria-describedby="new-member-password-hint"
                className="h-9 pr-9"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={
                  showPassword ? 'Нууц үгийг нуух' : 'Нууц үгийг харуулах'
                }
                className="absolute inset-y-0 right-1.5 my-auto text-muted-foreground"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <p
              id="new-member-password-hint"
              className="text-[0.625rem]/relaxed text-muted-foreground"
            >
              Дор хаяж 8 тэмдэгт, том, жижиг үсэг болон тусгай тэмдэгт агуулсан
              байх. Хоосон орхивол гишүүн нэвтрэх боломжгүй.
            </p>
          </div>

          {error ? (
            <p role="alert" className="text-xs/relaxed text-destructive">
              {error.message}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => handleOpenChange(false)}
              disabled={createMember.isPending}
            >
              Болих
            </Button>
            <Button type="submit" size="lg" disabled={createMember.isPending}>
              {createMember.isPending ? 'Нэмж байна…' : 'Нэмэх'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateMemberDialog
