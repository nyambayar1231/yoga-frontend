import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Plus } from 'lucide-react'
import EnrollStudentDialog from '@/features/enrollment/EnrollStudentDialog'
import { useClassRoster, useUnenrollStudent } from '@/features/enrollment/use-enrollments'
import { useClass } from '@/features/class/use-classes'
import { useIsAdmin } from '@/features/auth/use-session'
import { formatDate } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const SKELETON_ROWS = [0, 1, 2]

function ClassDetailPage() {
  const { id = '' } = useParams()
  const { data: schoolClass } = useClass(id)
  const { data: roster, isPending, isError } = useClassRoster(id)
  const [enrollOpen, setEnrollOpen] = useState(false)
  // Anyone with staff access can read the roster; only an admin may edit it.
  const isAdmin = useIsAdmin()

  const columnCount = isAdmin ? 3 : 2

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <Link
            to="/classes"
            className="inline-flex items-center gap-1 text-[0.6875rem]/relaxed text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" />
            Ангиуд
          </Link>
          <h1 className="font-heading text-base font-medium tracking-tight uppercase">
            {schoolClass ? schoolClass.name : <Skeleton className="h-5 w-12" />}
          </h1>
          <p className="text-xs/relaxed text-muted-foreground">
            Энэ ангид одоо элссэн идэвхтэй сурагчид.
          </p>
        </div>

        {isAdmin ? (
          <Button size="lg" onClick={() => setEnrollOpen(true)}>
            <Plus />
            Сурагч элсүүлэх
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 px-4">Нэр</TableHead>
              <TableHead className="h-9 w-36 px-4">Элссэн огноо</TableHead>
              {isAdmin ? <TableHead className="h-9 w-24 px-4" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              SKELETON_ROWS.map((row) => (
                <TableRow key={row} className="hover:bg-transparent">
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-40" />
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-20" />
                  </TableCell>
                  {isAdmin ? <TableCell className="px-4 py-2.5" /> : null}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columnCount}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Ангийн жагсаалтыг татаж чадсангүй.
                </TableCell>
              </TableRow>
            ) : roster && roster.length > 0 ? (
              roster.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="px-4 py-2.5 font-medium">
                    {entry.studentId.fullName}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-muted-foreground tabular-nums">
                    <time dateTime={entry.enrolledAt}>
                      {formatDate(entry.enrolledAt)}
                    </time>
                  </TableCell>
                  {isAdmin ? (
                    <UnenrollCell classId={id} enrollmentId={entry.id} />
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columnCount}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Энэ ангид сурагч алга байна.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EnrollStudentDialog classId={id} open={enrollOpen} onOpenChange={setEnrollOpen} />
    </div>
  )
}

interface UnenrollCellProps {
  classId: string
  enrollmentId: string
}

/** Its own component so one row's pending state does not disable every row's button. */
function UnenrollCell({ classId, enrollmentId }: UnenrollCellProps) {
  const unenrollStudent = useUnenrollStudent(classId)

  return (
    <TableCell className="px-4 py-2.5 text-right">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={unenrollStudent.isPending}
        onClick={() => unenrollStudent.mutate(enrollmentId)}
      >
        Хасах
      </Button>
    </TableCell>
  )
}

export default ClassDetailPage
