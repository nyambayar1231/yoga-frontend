import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { ApiError } from '@/lib/api'
import { classTypesQueryOptions } from '@/features/class-type/use-class-types'
import { instructorsQueryOptions } from '@/features/instructor/use-instructors'
import {
  createClassSessionErrorMessage,
  useCreateClassSession,
} from './use-class-sessions'
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

/**
 * What POST /api/class-sessions accepts, checked before the round-trip so a
 * typo does not cost one. The rules mirror the backend's; the wording is ours.
 */
const formSchema = z.object({
  classTypeId: z.string().min(1, 'Хичээлээ сонгоно уу.'),
  instructorId: z.string().min(1, 'Багшаа сонгоно уу.'),
  startAt: z
    .string()
    .min(1, 'Эхлэх огноо, цагийг оруулна уу.')
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Огноо, цаг буруу байна.')
    // <input type="datetime-local"> gives local wall-clock with no offset; the
    // backend stores UTC, so convert rather than sending the raw string.
    .transform((value) => new Date(value).toISOString()),
})

type FormField = keyof z.infer<typeof formSchema>

/** Which field the backend's rejection belongs to, when its code names one. */
const FIELD_BY_CODE: Record<string, FormField> = {
  INSTRUCTOR_DOUBLE_BOOKED: 'instructorId',
  INSTRUCTOR_INACTIVE: 'instructorId',
  INSTRUCTOR_NOT_FOUND: 'instructorId',
  CLASS_TYPE_INACTIVE: 'classTypeId',
  CLASS_TYPE_NOT_FOUND: 'classTypeId',
  INVALID_TIME_RANGE: 'startAt',
}

interface FormError {
  field?: FormField
  message: string
}

interface CreateClassSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CreateClassSessionDialog({ open, onOpenChange }: CreateClassSessionDialogProps) {
  const [classTypeId, setClassTypeId] = useState('')
  const [instructorId, setInstructorId] = useState('')
  const [startAt, setStartAt] = useState('')
  const [formError, setFormError] = useState<FormError | null>(null)

  const classTypes = useQuery(classTypesQueryOptions)
  // The instructor dropdown reads profiles, not logins: classSessions.instructorId
  // points at an instructor profile, so a user id here would not resolve.
  const instructors = useQuery(instructorsQueryOptions)

  // A retired class type or instructor is rejected by the backend, so it should
  // not be offered in the first place.
  const activeClassTypes = useMemo(
    () => classTypes.data?.filter((classType) => classType.isActive) ?? [],
    [classTypes.data],
  )
  const activeInstructors = useMemo(
    () => instructors.data?.filter((instructor) => instructor.isActive) ?? [],
    [instructors.data],
  )

  const selectedClassType = activeClassTypes.find((option) => option.id === classTypeId)

  const createSession = useCreateClassSession()

  /** Stale red borders should not outlive the edit that fixes them. */
  function clearErrors() {
    if (formError) setFormError(null)
    if (createSession.error) createSession.reset()
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setClassTypeId('')
      setInstructorId('')
      setStartAt('')
      setFormError(null)
      createSession.reset()
    }
    onOpenChange(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = formSchema.safeParse({ classTypeId, instructorId, startAt })
    if (!result.success) {
      // One message at a time, flagging the field it belongs to.
      const [issue] = result.error.issues
      setFormError({ field: issue.path[0] as FormField, message: issue.message })
      return
    }

    setFormError(null)
    createSession.mutate(result.data, { onSuccess: () => handleOpenChange(false) })
  }

  const serverError: FormError | null = createSession.error
    ? {
        field:
          createSession.error instanceof ApiError
            ? FIELD_BY_CODE[createSession.error.code]
            : undefined,
        message: createClassSessionErrorMessage(createSession.error),
      }
    : null

  const error = formError ?? serverError
  const nothingToSchedule = !classTypes.isPending && activeClassTypes.length === 0
  const noInstructors = !instructors.isPending && activeInstructors.length === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Хичээл товлох</DialogTitle>
          <DialogDescription>
            Аль хичээлийг, хэн, хэзээ заахыг сонгоно уу.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-session-class-type">Хичээл</Label>
            <Select
              value={classTypeId}
              onValueChange={(value) => {
                setClassTypeId(value as string)
                clearErrors()
              }}
              disabled={createSession.isPending || activeClassTypes.length === 0}
            >
              <SelectTrigger
                id="new-session-class-type"
                className="h-9 w-full"
                aria-invalid={error?.field === 'classTypeId'}
              >
                {/* Base UI renders the raw value unless given a formatter. */}
                <SelectValue placeholder="Хичээл сонгох">
                  {(value: string | null) =>
                    activeClassTypes.find((option) => option.id === value)?.name ?? ''
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {activeClassTypes.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {nothingToSchedule ? (
              <p className="text-[0.625rem]/relaxed text-muted-foreground">
                Идэвхтэй хичээл алга. Эхлээд «Хичээлийн төрөл» хэсэгт хичээл
                нэмнэ үү.
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-session-instructor">Багш</Label>
            <Select
              value={instructorId}
              onValueChange={(value) => {
                setInstructorId(value as string)
                clearErrors()
              }}
              disabled={createSession.isPending || activeInstructors.length === 0}
            >
              <SelectTrigger
                id="new-session-instructor"
                className="h-9 w-full"
                aria-invalid={error?.field === 'instructorId'}
              >
                <SelectValue placeholder="Багш сонгох">
                  {(value: string | null) =>
                    activeInstructors.find((option) => option.id === value)?.fullName ?? ''
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {activeInstructors.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {noInstructors ? (
              <p className="text-[0.625rem]/relaxed text-muted-foreground">
                Идэвхтэй багш алга. Эхлээд «Багш нар» хэсэгт багш нэмнэ үү.
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-session-start">Эхлэх огноо, цаг</Label>
            <Input
              id="new-session-start"
              type="datetime-local"
              value={startAt}
              onChange={(event) => {
                setStartAt(event.target.value)
                clearErrors()
              }}
              disabled={createSession.isPending}
              aria-invalid={error?.field === 'startAt'}
              className="h-9"
            />
            <p className="text-[0.625rem]/relaxed text-muted-foreground">
              {selectedClassType
                ? `Дуусах цаг ба багтаамжийг «${selectedClassType.name}»-с автоматаар авна: ${selectedClassType.durationMinutes} минут, ${selectedClassType.capacity} хүн.`
                : 'Дуусах цаг ба багтаамжийг сонгосон хичээлээс автоматаар авна.'}
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
              disabled={createSession.isPending}
            >
              Болих
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={createSession.isPending || nothingToSchedule || noInstructors}
            >
              {createSession.isPending ? 'Товлож байна…' : 'Товлох'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateClassSessionDialog
