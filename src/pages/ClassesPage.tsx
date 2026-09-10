import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import CreateClassDialog from '@/features/class/CreateClassDialog'
import { useClasses } from '@/features/class/use-classes'
import { useIsAdmin } from '@/features/auth/use-session'
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

const COLUMN_COUNT = 2
const SKELETON_ROWS = [0, 1, 2]

function ClassesPage() {
  const { data: classes, isPending, isError } = useClasses()
  const [createOpen, setCreateOpen] = useState(false)
  // Anyone signed in may read the class list; only an admin may add to it.
  const isAdmin = useIsAdmin()
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="font-heading text-base font-medium tracking-tight">
            Ангиуд
          </h1>
          <p className="text-xs/relaxed text-muted-foreground">
            Сургуулийн ангиуд. Аль сурагч алинд нь байгааг элсэлт дээр
            бүртгэнэ.
          </p>
        </div>

        {isAdmin ? (
          <Button size="lg" onClick={() => setCreateOpen(true)}>
            <Plus />
            Анги нэмэх
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 px-4">Анги</TableHead>
              <TableHead className="h-9 w-28 px-4">Төлөв</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              SKELETON_ROWS.map((row) => (
                <TableRow key={row} className="hover:bg-transparent">
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-14" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Ангиудын жагсаалтыг татаж чадсангүй.
                </TableCell>
              </TableRow>
            ) : classes && classes.length > 0 ? (
              classes.map((schoolClass) => (
                <TableRow
                  key={schoolClass.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/classes/${schoolClass.id}`)}
                >
                  <TableCell className="px-4 py-2.5 font-medium uppercase">
                    <Link to={`/classes/${schoolClass.id}`} className="hover:underline">
                      {schoolClass.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Badge variant={schoolClass.isActive ? 'secondary' : 'outline'}>
                      {schoolClass.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
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
                  Анги бүртгэгдээгүй байна.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateClassDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

export default ClassesPage
