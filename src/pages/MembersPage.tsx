import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateMemberDialog from '@/features/member/CreateMemberDialog'
import { useMembers } from '@/features/member/use-members'
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

const COLUMN_COUNT = 2
const SKELETON_ROWS = [0, 1, 2]

function MembersPage() {
  const { data: members, isPending, isError } = useMembers()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="font-heading text-base font-medium tracking-tight">
            Гишүүд
          </h1>
          <p className="text-xs/relaxed text-muted-foreground">
            Клубын гишүүдийн жагсаалт.
          </p>
        </div>

        <Button size="lg" onClick={() => setCreateOpen(true)}>
          <Plus />
          Гишүүн нэмэх
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 px-4">Нэр</TableHead>
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
                  Гишүүдийн жагсаалтыг татаж чадсангүй.
                </TableCell>
              </TableRow>
            ) : members && members.length > 0 ? (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="px-4 py-2.5 font-medium">
                    {member.fullName}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-muted-foreground tabular-nums">
                    <time dateTime={member.createdAt}>
                      {formatDate(member.createdAt)}
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
                  Гишүүн бүртгэгдээгүй байна.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateMemberDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

export default MembersPage
