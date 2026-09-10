import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { z } from 'zod'
import type { UserRole } from '@/features/auth/auth.api'
import { ApiError } from '@/lib/api'
import { createUserErrorMessage, useCreateUser } from './use-create-user'
import {
  EMAIL_RE,
  isPasswordTooLong,
  passwordProblems,
} from '@/lib/password'
import { roleLabel } from './use-users'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 'teacher' and 'student' logins need a profile to point at, so they are
// created through POST /api/teachers and POST /api/students instead.
const ROLES = ['admin'] as const satisfies readonly UserRole[]

/**
 * What POST /api/users accepts, checked before the round-trip so a typo does
 * not cost one. The rules mirror the backend's; the wording is ours.
 */
const formSchema = z.object({
  email: z.string().trim().regex(EMAIL_RE, 'Зөв имэйл хаяг оруулна уу.'),
  password: z.string().superRefine((password, ctx) => {
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
  }),
  role: z.enum(ROLES),
})

type FormField = keyof z.infer<typeof formSchema>

/** Which field the backend's rejection belongs to, when its code names one. */
const FIELD_BY_CODE: Record<string, FormField> = {
  EMAIL_IN_USE: 'email',
  WEAK_PASSWORD: 'password',
  PROFILE_REQUIRED: 'role',
  PROFILE_LINK_INVALID: 'role',
}

interface FormError {
  field?: FormField
  message: string
}

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('admin')
  const [showPassword, setShowPassword] = useState(false)
  // Which field to flag, so a bad email does not mark the password invalid too.
  const [formError, setFormError] = useState<FormError | null>(null)

  const createUser = useCreateUser()

  /** Stale red borders should not outlive the edit that fixes them. */
  function clearErrors() {
    if (formError) setFormError(null)
    if (createUser.error) createUser.reset()
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setEmail('')
      setPassword('')
      setRole('admin')
      setShowPassword(false)
      setFormError(null)
      createUser.reset()
    }
    onOpenChange(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = formSchema.safeParse({ email, password, role })
    if (!result.success) {
      // One message at a time, flagging the field it belongs to, so a bad email
      // does not also mark the password invalid.
      const [issue] = result.error.issues
      setFormError({ field: issue.path[0] as FormField, message: issue.message })
      return
    }

    setFormError(null)
    createUser.mutate(result.data, { onSuccess: () => handleOpenChange(false) })
  }

  const serverError: FormError | null = createUser.error
    ? {
        field:
          createUser.error instanceof ApiError
            ? FIELD_BY_CODE[createUser.error.code]
            : undefined,
        message: createUserErrorMessage(createUser.error),
      }
    : null

  const error = formError ?? serverError

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Хэрэглэгч нэмэх</DialogTitle>
          <DialogDescription>
            Шинэ хэрэглэгчийн мэдээллийг оруулна уу.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-user-email">Имэйл хаяг</Label>
            <Input
              id="new-user-email"
              type="email"
              autoComplete="off"
              placeholder="bagsh@yoga.mn"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                clearErrors()
              }}
              disabled={createUser.isPending}
              aria-invalid={error?.field === 'email'}
              className="h-9"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-user-password">Нууц үг</Label>
            <div className="relative">
              <Input
                id="new-user-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  clearErrors()
                }}
                disabled={createUser.isPending}
                aria-invalid={error?.field === 'password'}
                aria-describedby="new-user-password-hint"
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
              id="new-user-password-hint"
              className="text-[0.625rem]/relaxed text-muted-foreground"
            >
              Дор хаяж 8 тэмдэгт, том, жижиг үсэг болон тусгай тэмдэгт агуулсан
              байх.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-user-role">Эрх</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
              disabled={createUser.isPending}
            >
              <SelectTrigger id="new-user-role" className="h-9 w-full">
                {/* Base UI renders the raw value unless given a formatter. */}
                <SelectValue>
                  {(value: string | null) => (value ? roleLabel(value) : '')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {roleLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={createUser.isPending}
            >
              Болих
            </Button>
            <Button type="submit" size="lg" disabled={createUser.isPending}>
              {createUser.isPending ? 'Нэмж байна…' : 'Нэмэх'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateUserDialog
