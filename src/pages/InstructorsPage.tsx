import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateInstructorDialog from '@/features/instructor/CreateInstructorDialog'
import { useTeachingStaff } from '@/features/instructor/use-instructors'
import { roleLabel } from '@/features/user/use-users'
import { formatDate } from '@/lib/date'
import { Badge } from '@/components/ui/badge'
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

const COLUMN_COUNT = 4
const SKELETON_ROWS = [0, 1, 2]

function InstructorsPage() {
  const { data: staff, isPending, isError } = useTeachingStaff()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="font-heading text-base font-medium tracking-tight">
            Багш нар
          </h1>
          <p className="text-xs/relaxed text-muted-foreground">
            Хичээл заах боломжтой багш нар. Админ эрхтэй хүн багшаар хичээл
            заах боломжтой тул энд мөн харагдана.
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
              <TableHead className="h-9 px-4">Имэйл</TableHead>
              <TableHead className="h-9 w-32 px-4">Эрх</TableHead>
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
                    <Skeleton className="h-3.5 w-48" />
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-14" />
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
            ) : staff && staff.length > 0 ? (
              staff.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="px-4 py-2.5 font-medium">
                    {/* An admin without an instructor profile has no name on file. */}
                    {person.fullName ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2.5">{person.email}</TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Badge
                      variant={person.role === 'admin' ? 'secondary' : 'outline'}
                    >
                      {roleLabel(person.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-muted-foreground tabular-nums">
                    <time dateTime={person.createdAt}>
                      {formatDate(person.createdAt)}
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

      <CreateInstructorDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

export default InstructorsPage
