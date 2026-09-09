import { useSession } from '@/features/auth/use-session'
import AppSidebar from '@/components/AppSidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

function DashboardPage() {
  const { data: user } = useSession()

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          {/* Separator's base classes set align-self:stretch, which degrades to
              flex-start once h-4 makes the height definite. Tailwind emits
              self-stretch after self-center at equal specificity, so the
              override has to be important to land. */}
          <Separator orientation="vertical" className="mr-2 h-4 self-center!" />
          <h1 className="font-heading text-xs font-medium">Нүүр</h1>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <p className="text-xs/relaxed text-muted-foreground">
            Тавтай морил{user ? `, ${user.email}` : ''}.
          </p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardPage
