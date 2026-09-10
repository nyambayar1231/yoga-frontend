import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { ApiError } from '@/lib/api'
import { studentsQueryOptions } from '@/features/student/use-students'
import { SCHOOL_YEAR_PATTERN } from './enrollment.api'
import { enrollErrorMessage, useEnrollStudent } from './use-enrollments'
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

/** The school year containing today. Mongolian schools start in September. */
function currentSchoolYear(): string {
  const now = new Date()
  const startYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
  return `${startYear}-${startYear + 1}`
}

/**
 * What POST /api/classes/:id/students accepts, checked before the round-trip
 * so a typo does not cost one. The rules mirror the backend's.
 */
const formSchema = z.object({
  studentId: z.string().min(1, 'Сурагчаа сонгоно уу.'),
  schoolYear: z
    .string()
    .trim()
    .regex(SCHOOL_YEAR_PATTERN, "Хичээлийн жилийг '2026-2027' хэлбэрээр оруулна уу."),
})

type FormField = keyof z.infer<typeof formSchema>

/** Which field the backend's rejection belongs to, when its code names one. */
const FIELD_BY_CODE: Record<string, FormField> = {
  STUDENT_NOT_FOUND: 'studentId',
  ALREADY_ENROLLED: 'studentId',
}

interface FormError {
  field?: FormField
  message: string
}

interface EnrollStudentDialogProps {
  classId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function EnrollStudentDialog({ classId, open, onOpenChange }: EnrollStudentDialogProps) {
  const [studentId, setStudentId] = useState('')
  const [schoolYear, setSchoolYear] = useState(currentSchoolYear())
  // Which field to flag, so a bad school year does not mark the student invalid too.
  const [formError, setFormError] = useState<FormError | null>(null)

  const students = useQuery(studentsQueryOptions)
  const activeStudents = students.data?.filter((student) => student.isActive) ?? []

  const enrollStudent = useEnrollStudent(classId)

  /** Stale red borders should not outlive the edit that fixes them. */
  function clearErrors() {
    if (formError) setFormError(null)
    if (enrollStudent.error) enrollStudent.reset()
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setStudentId('')
      setSchoolYear(currentSchoolYear())
      setFormError(null)
      enrollStudent.reset()
    }
    onOpenChange(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = formSchema.safeParse({ studentId, schoolYear })
    if (!result.success) {
      // One message at a time, flagging the field it belongs to.
      const [issue] = result.error.issues
      setFormError({ field: issue.path[0] as FormField, message: issue.message })
      return
    }

    setFormError(null)
    enrollStudent.mutate(result.data, { onSuccess: () => handleOpenChange(false) })
  }

  const serverError: FormError | null = enrollStudent.error
    ? {
        field:
          enrollStudent.error instanceof ApiError
            ? FIELD_BY_CODE[enrollStudent.error.code]
            : undefined,
        message: enrollErrorMessage(enrollStudent.error),
      }
    : null

  const error = formError ?? serverError
  const noStudents = !students.isPending && activeStudents.length === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сурагч элсүүлэх</DialogTitle>
          <DialogDescription>
            Сонгосон сурагчийг энэ ангид, тухайн хичээлийн жилээр элсүүлнэ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="enroll-student">Сурагч</Label>
            <Select
              value={studentId}
              onValueChange={(value) => {
                setStudentId(value as string)
                clearErrors()
              }}
              disabled={enrollStudent.isPending || activeStudents.length === 0}
            >
              <SelectTrigger
                id="enroll-student"
                className="h-9 w-full"
                aria-invalid={error?.field === 'studentId'}
              >
                {/* Base UI renders the raw value unless given a formatter. */}
                <SelectValue placeholder="Сурагч сонгох">
                  {(value: string | null) =>
                    activeStudents.find((option) => option.id === value)?.fullName ?? ''
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {activeStudents.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {noStudents ? (
              <p className="text-[0.625rem]/relaxed text-muted-foreground">
                Идэвхтэй сурагч алга байна. Эхлээд сурагч бүртгэнэ үү.
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="enroll-school-year">Хичээлийн жил</Label>
            <Input
              id="enroll-school-year"
              autoComplete="off"
              placeholder="2026-2027"
              value={schoolYear}
              onChange={(event) => {
                setSchoolYear(event.target.value)
                clearErrors()
              }}
              disabled={enrollStudent.isPending}
              aria-invalid={error?.field === 'schoolYear'}
              className="h-9"
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
              disabled={enrollStudent.isPending}
            >
              Болих
            </Button>
            <Button type="submit" size="lg" disabled={enrollStudent.isPending || noStudents}>
              {enrollStudent.isPending ? 'Элсүүлж байна…' : 'Элсүүлэх'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EnrollStudentDialog
