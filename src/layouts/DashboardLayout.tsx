import { Outlet, useLocation } from 'react-router'
import AppSidebar from '@/components/AppSidebar'
import { NAV_ITEMS } from '@/config/navigation'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

function DashboardLayout() {
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find((item) => item.to === pathname)

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
          <span className="text-xs text-muted-foreground">
            {current?.label}
          </span>
        </header>

        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardLayout
