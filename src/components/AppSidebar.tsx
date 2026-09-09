import { useState } from 'react'
import { ChevronsUpDown, Flower2 } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { navItemsFor } from '@/config/navigation'
import { useLogout, useSession } from '@/features/auth/use-session'
import LogoutDialog from '@/features/auth/LogoutDialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

function AppSidebar() {
  const { pathname } = useLocation()
  const { data: user } = useSession()
  const logout = useLogout()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const navItems = navItemsFor(user?.role)

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Flower2 className="size-4" />
          </div>
          <span className="font-heading text-xs font-medium">Yoga CMS</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    isActive={pathname === to}
                    render={<Link to={to} />}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => setConfirmOpen(true)}
              aria-haspopup="dialog"
            >
              <Avatar className="size-7 rounded-md">
                <AvatarFallback className="rounded-md text-[0.625rem] uppercase">
                  {user?.email.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{user?.email}</span>
              <ChevronsUpDown className="ml-auto text-muted-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <LogoutDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        isPending={logout.isPending}
        isError={logout.isError}
        onConfirm={() => logout.mutate()}
      />
    </Sidebar>
  )
}

export default AppSidebar
