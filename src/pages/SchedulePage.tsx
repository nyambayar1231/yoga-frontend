import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateClassSessionDialog from '@/features/class-session/CreateClassSessionDialog'
import {
  sessionStatusLabel,
  useClassSessions,
} from '@/features/class-session/use-class-sessions'
import { categoryLabel } from '@/features/class-type/use-class-types'
import { useIsAdmin } from '@/features/auth/use-session'
import { formatDate, formatTime } from '@/lib/date'
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

const COLUMN_COUNT = 5
const SKELETON_ROWS = [0, 1, 2]

/** A cancelled class should not read as if it were still going ahead. */
const STATUS_VARIANT = {
  scheduled: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
} as const

function SchedulePage() {
  const { data: sessions, isPending, isError } = useClassSessions()
  const [createOpen, setCreateOpen] = useState(false)
  // Anyone signed in may read the timetable; only an admin may schedule.
  const isAdmin = useIsAdmin()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="font-heading text-base font-medium tracking-tight">
            Хуваарь
          </h1>
          <p className="text-xs/relaxed text-muted-foreground">
            Товлогдсон хичээлүүд, эхлэх цагаар нь эрэмбэлэгдсэн.
          </p>
        </div>

        {isAdmin ? (
          <Button size="lg" onClick={() => setCreateOpen(true)}>
            <Plus />
            Хичээл товлох
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 w-44 px-4">Огноо, цаг</TableHead>
              <TableHead className="h-9 px-4">Хичээл</TableHead>
              <TableHead className="h-9 px-4">Багш</TableHead>
              <TableHead className="h-9 w-28 px-4">Багтаамж</TableHead>
              <TableHead className="h-9 w-32 px-4">Төлөв</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              SKELETON_ROWS.map((row) => (
                <TableRow key={row} className="hover:bg-transparent">
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-32" />
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-40" />
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-32" />
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-10" />
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Хуваарийг татаж чадсангүй.
                </TableCell>
              </TableRow>
            ) : sessions && sessions.length > 0 ? (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="px-4 py-2.5 tabular-nums">
                    <div className="grid gap-0.5">
                      <time dateTime={session.startAt} className="font-medium">
                        {formatDate(session.startAt)}
                      </time>
                      <span className="text-[0.6875rem]/relaxed text-muted-foreground">
                        {formatTime(session.startAt)}–{formatTime(session.endAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{session.classTypeId.name}</span>
                      <Badge variant="outline">
                        {categoryLabel(session.classTypeId.category)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    {session.instructorId.fullName}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-muted-foreground tabular-nums">
                    {session.capacity} хүн
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Badge variant={STATUS_VARIANT[session.status]}>
                      {sessionStatusLabel(session.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Товлогдсон хичээл алга байна.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateClassSessionDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

export default SchedulePage
