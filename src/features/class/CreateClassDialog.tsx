import { useState } from 'react'
import type { FormEvent } from 'react'
import { CLASS_SECTIONS, GRADES, createClassSchema, type ClassSection } from './class.api'
import { createClassErrorMessage, useCreateClass } from './use-classes'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DEFAULT_GRADE = String(GRADES[0])
const DEFAULT_SECTION = CLASS_SECTIONS[0]

interface FormError {
  message: string
}

interface CreateClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CreateClassDialog({ open, onOpenChange }: CreateClassDialogProps) {
  const [grade, setGrade] = useState(DEFAULT_GRADE)
  const [section, setSection] = useState<ClassSection>(DEFAULT_SECTION)
  const [formError, setFormError] = useState<FormError | null>(null)

  const createClass = useCreateClass()

  /** A stale error should not outlive the edit that fixes it. */
  function clearErrors() {
    if (formError) setFormError(null)
    if (createClass.error) createClass.reset()
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setGrade(DEFAULT_GRADE)
      setSection(DEFAULT_SECTION)
      setFormError(null)
      createClass.reset()
    }
    onOpenChange(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Both fields come from a Select, so there is nothing left to mistype —
    // this only exists to hand the parsed, numeric grade to the mutation.
    const result = createClassSchema.safeParse({ grade, section })
    if (!result.success) {
      setFormError({ message: result.error.issues[0].message })
      return
    }

    setFormError(null)
    createClass.mutate(result.data, { onSuccess: () => handleOpenChange(false) })
  }

  const error: FormError | null =
    formError ??
    (createClass.error ? { message: createClassErrorMessage(createClass.error) } : null)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Анги нэмэх</DialogTitle>
          <DialogDescription>Ангийн анги, бүлгийг сонгоно уу.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="new-class-grade">Анги</Label>
              <Select
                value={grade}
                onValueChange={(value) => {
                  setGrade(value as string)
                  clearErrors()
                }}
                disabled={createClass.isPending}
              >
                <SelectTrigger id="new-class-grade" className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-class-section">Бүлэг</Label>
              <Select
                value={section}
                onValueChange={(value) => {
                  setSection(value as ClassSection)
                  clearErrors()
                }}
                disabled={createClass.isPending}
              >
                <SelectTrigger id="new-class-section" className="h-9 w-full">
                  {/* Stored lowercase; shown upper case, e.g. 'A' rather than 'a'. */}
                  <SelectValue>
                    {(value: string | null) => (value ? value.toUpperCase() : '')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CLASS_SECTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              disabled={createClass.isPending}
            >
              Болих
            </Button>
            <Button type="submit" size="lg" disabled={createClass.isPending}>
              {createClass.isPending ? 'Нэмж байна…' : 'Нэмэх'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateClassDialog
