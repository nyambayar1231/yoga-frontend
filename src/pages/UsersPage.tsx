import { Plus } from 'lucide-react'
import { useUsers } from '@/features/user/use-users'
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

function UsersPage() {
  const { data: users, isPending, isError } = useUsers()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="font-heading text-base font-medium tracking-tight">
            Хэрэглэгчид
          </h1>
          <p className="text-xs/relaxed text-muted-foreground">
            Системд нэвтрэх боломжтой хэрэглэгчид.
          </p>
        </div>

        <Button size="lg">
          <Plus />
          Хэрэглэгч нэмэх
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 px-4">Имэйл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              SKELETON_ROWS.map((row) => (
                <TableRow key={row} className="hover:bg-transparent">
                  <TableCell className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-48" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell className="px-4 py-8 text-center text-muted-foreground">
                  Хэрэглэгчийн жагсаалтыг татаж чадсангүй.
                </TableCell>
              </TableRow>
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-4 py-2.5 font-medium">
                    {user.email}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell className="px-4 py-8 text-center text-muted-foreground">
                  Хэрэглэгч бүртгэгдээгүй байна.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default UsersPage
