import { useState } from 'react'
import type { FormEvent } from 'react'
import { z } from 'zod'
import { ApiError } from '@/lib/api'
import {
  CAPACITY_MAX,
  CAPACITY_MIN,
  CLASS_CATEGORIES,
  DESCRIPTION_MAX_LENGTH,
  DURATION_MAX_MINUTES,
  DURATION_MIN_MINUTES,
  NAME_MAX_LENGTH,
  type ClassCategory,
} from './class-type.api'
import {
  categoryLabel,
  createClassTypeErrorMessage,
  useCreateClassType,
} from './use-class-types'
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
import { Textarea } from '@/components/ui/textarea'

/**
 * A whole number within range. Checked as text first so a stray letter reports
 * our wording rather than zod's "expected number, received NaN".
 */
function wholeNumberField(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .regex(/^\d+$/, `${label} бүхэл тоогоор оруулна уу.`)
    .transform(Number)
    .refine((value) => value >= min && value <= max, `${label} ${min}-${max} хооронд байх ёстой.`)
}

/**
 * What POST /api/class-types accepts, checked before the round-trip so a typo
 * does not cost one. The rules mirror the backend's; the wording is ours.
 */
const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Хичээлийн нэрийг оруулна уу.')
    .max(NAME_MAX_LENGTH, `Нэр ${NAME_MAX_LENGTH} тэмдэгтээс хэтрэхгүй байх.`),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX_LENGTH, `Тайлбар ${DESCRIPTION_MAX_LENGTH} тэмдэгтээс хэтрэхгүй байх.`)
    // Optional on the backend, so send nothing rather than an empty string.
    .transform((value) => (value === '' ? undefined : value)),
  category: z.enum(CLASS_CATEGORIES),
  durationMinutes: wholeNumberField(
    'Үргэлжлэх хугацааг',
    DURATION_MIN_MINUTES,
    DURATION_MAX_MINUTES,
  ),
  capacity: wholeNumberField('Багтаамжийг', CAPACITY_MIN, CAPACITY_MAX),
})

type FormField = keyof z.infer<typeof formSchema>

/** Which field the backend's rejection belongs to, when its code names one. */
const FIELD_BY_CODE: Record<string, FormField> = {
  CLASS_TYPE_EXISTS: 'name',
}

interface FormError {
  field?: FormField
  message: string
}

interface CreateClassTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CreateClassTypeDialog({ open, onOpenChange }: CreateClassTypeDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ClassCategory>('yoga')
  // Sensible starting points for a studio class, so the common case is typing-free.
  const [durationMinutes, setDurationMinutes] = useState('60')
  const [capacity, setCapacity] = useState('20')
  // Which field to flag, so a bad name does not mark the capacity invalid too.
  const [formError, setFormError] = useState<FormError | null>(null)

  const createClassType = useCreateClassType()

  /** Stale red borders should not outlive the edit that fixes them. */
  function clearErrors() {
    if (formError) setFormError(null)
    if (createClassType.error) createClassType.reset()
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName('')
      setDescription('')
      setCategory('yoga')
      setDurationMinutes('60')
      setCapacity('20')
      setFormError(null)
      createClassType.reset()
    }
    onOpenChange(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = formSchema.safeParse({
      name,
      description,
      category,
      durationMinutes,
      capacity,
    })
    if (!result.success) {
      // One message at a time, flagging the field it belongs to.
      const [issue] = result.error.issues
      setFormError({ field: issue.path[0] as FormField, message: issue.message })
      return
    }

    setFormError(null)
    createClassType.mutate(result.data, { onSuccess: () => handleOpenChange(false) })
  }

  const serverError: FormError | null = createClassType.error
    ? {
        field:
          createClassType.error instanceof ApiError
            ? FIELD_BY_CODE[createClassType.error.code]
            : undefined,
        message: createClassTypeErrorMessage(createClassType.error),
      }
    : null

  const error = formError ?? serverError

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Хичээлийн төрөл нэмэх</DialogTitle>
          <DialogDescription>
            Хичээл нь өөрөө хэдэн цагт болохыг заадаггүй. Цаг, өдрийг нь
            хуваарь дээр товлоно.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-class-type-name">Нэр</Label>
            <Input
              id="new-class-type-name"
              autoComplete="off"
              placeholder="Хатха йог 101"
              maxLength={NAME_MAX_LENGTH}
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                clearErrors()
              }}
              disabled={createClassType.isPending}
              aria-invalid={error?.field === 'name'}
              className="h-9"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-class-type-category">Ангилал</Label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value as ClassCategory)
                clearErrors()
              }}
              disabled={createClassType.isPending}
            >
              <SelectTrigger id="new-class-type-category" className="h-9 w-full">
                {/* Base UI renders the raw value unless given a formatter. */}
                <SelectValue>
                  {(value: string | null) => (value ? categoryLabel(value) : '')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CLASS_CATEGORIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {categoryLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="new-class-type-duration">Үргэлжлэх хугацаа</Label>
              <div className="relative">
                <Input
                  id="new-class-type-duration"
                  inputMode="numeric"
                  value={durationMinutes}
                  onChange={(event) => {
                    setDurationMinutes(event.target.value)
                    clearErrors()
                  }}
                  disabled={createClassType.isPending}
                  aria-invalid={error?.field === 'durationMinutes'}
                  className="h-9 pr-12"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[0.625rem] text-muted-foreground">
                  минут
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-class-type-capacity">Багтаамж</Label>
              <div className="relative">
                <Input
                  id="new-class-type-capacity"
                  inputMode="numeric"
                  value={capacity}
                  onChange={(event) => {
                    setCapacity(event.target.value)
                    clearErrors()
                  }}
                  disabled={createClassType.isPending}
                  aria-invalid={error?.field === 'capacity'}
                  className="h-9 pr-12"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[0.625rem] text-muted-foreground">
                  хүн
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="new-class-type-description">Тайлбар</Label>
              <span className="text-[0.625rem]/relaxed text-muted-foreground">
                Заавал биш
              </span>
            </div>
            <Textarea
              id="new-class-type-description"
              placeholder="Анхан шатны сурагчдад зориулсан суурь хичээл."
              maxLength={DESCRIPTION_MAX_LENGTH}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                clearErrors()
              }}
              disabled={createClassType.isPending}
              aria-invalid={error?.field === 'description'}
              rows={3}
            />
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
              disabled={createClassType.isPending}
            >
              Болих
            </Button>
            <Button type="submit" size="lg" disabled={createClassType.isPending}>
              {createClassType.isPending ? 'Нэмж байна…' : 'Нэмэх'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateClassTypeDialog
