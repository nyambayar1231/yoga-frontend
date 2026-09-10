import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateTeacherDialog from '@/features/teacher/CreateTeacherDialog'
import { useTeachers } from '@/features/teacher/use-teachers'
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

const COLUMN_COUNT = 3
const SKELETON_ROWS = [0, 1, 2]

function TeachersPage() {
  const { data: teachers, isPending, isError } = useTeachers()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="font-heading text-base font-medium tracking-tight">
            Багш нар
          </h1>
          <p className="text-xs/relaxed text-muted-foreground">
            Сургуулийн багш нарын жагсаалт.
          </p>
        </div>

        <Button size="lg" onClick={() => setCreateOpen(true)}>
          <Plus />
          Багш нэмэх
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 px-4">Нэр</TableHead>
              <TableHead className="h-9 px-4">Хичээлүүд</TableHead>
              <TableHead className="h-9 w-36 px-4">Үүссэн огноо</TableHead>
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
                    <Skeleton className="h-3.5 w-32" />
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Багш нарын жагсаалтыг татаж чадсангүй.
                </TableCell>
              </TableRow>
            ) : teachers && teachers.length > 0 ? (
              teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="px-4 py-2.5 font-medium">
                    {teacher.fullName}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-muted-foreground">
                    {teacher.subjects.length > 0 ? (
                      teacher.subjects.join(', ')
                    ) : (
                      <span>—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-muted-foreground tabular-nums">
                    <time dateTime={teacher.createdAt}>
                      {formatDate(teacher.createdAt)}
                    </time>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Багш бүртгэгдээгүй байна.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateTeacherDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

export default TeachersPage
