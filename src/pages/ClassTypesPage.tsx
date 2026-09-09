import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateClassTypeDialog from '@/features/class-type/CreateClassTypeDialog'
import { categoryLabel, useClassTypes } from '@/features/class-type/use-class-types'
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

const COLUMN_COUNT = 4
const SKELETON_ROWS = [0, 1, 2]

function ClassTypesPage() {
  const { data: classTypes, isPending, isError } = useClassTypes()
  const [createOpen, setCreateOpen] = useState(false)
  // Anyone signed in may read the catalogue; only an admin may add to it.
  const isAdmin = useIsAdmin()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="font-heading text-base font-medium tracking-tight">
            Хичээлийн төрөл
          </h1>
          <p className="text-xs/relaxed text-muted-foreground">
            Студийн санал болгодог хичээлүүд. Цаг, өдрийг нь хуваарь дээр
            товлоно.
          </p>
        </div>

        {isAdmin ? (
          <Button size="lg" onClick={() => setCreateOpen(true)}>
            <Plus />
            Хичээлийн төрөл нэмэх
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 px-4">Нэр</TableHead>
              <TableHead className="h-9 w-32 px-4">Ангилал</TableHead>
              <TableHead className="h-9 w-36 px-4">Үргэлжлэх хугацаа</TableHead>
              <TableHead className="h-9 w-28 px-4">Багтаамж</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              SKELETON_ROWS.map((row) => (
                <TableRow key={row} className="hover:bg-transparent">
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-44" />
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-10" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Хичээлийн жагсаалтыг татаж чадсангүй.
                </TableCell>
              </TableRow>
            ) : classTypes && classTypes.length > 0 ? (
              classTypes.map((classType) => (
                <TableRow key={classType.id}>
                  <TableCell className="px-4 py-2.5">
                    <div className="grid gap-0.5">
                      <span className="font-medium">{classType.name}</span>
                      {classType.description ? (
                        <span className="line-clamp-1 text-[0.6875rem]/relaxed text-muted-foreground">
                          {classType.description}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Badge variant="outline">
                      {categoryLabel(classType.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-muted-foreground tabular-nums">
                    {classType.durationMinutes} минут
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-muted-foreground tabular-nums">
                    {classType.capacity} хүн
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Хичээл бүртгэгдээгүй байна.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateClassTypeDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

export default ClassTypesPage
