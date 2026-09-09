import { useSession } from '@/features/auth/use-session'

function HomePage() {
  const { data: user } = useSession()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="grid gap-1">
        <h1 className="font-heading text-base font-medium tracking-tight">
          Нүүр
        </h1>
        <p className="text-xs/relaxed text-muted-foreground">
          Тавтай морил{user ? `, ${user.email}` : ''}.
        </p>
      </div>
    </div>
  )
}

export default HomePage
