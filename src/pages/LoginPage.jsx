import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError('Имэйл хаяг болон нууц үгээ бүрэн оруулна уу.')
      return
    }

    setError('')
    // TODO: нэвтрэх API-тай холбох
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6">
      <p className="font-heading text-sm font-medium tracking-tight">Yoga CMS</p>

      <Card className="w-full max-w-sm [--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="font-heading text-base">Нэвтрэх</CardTitle>
          <CardDescription>
            Системд нэвтрэхийн тулд мэдээллээ оруулна уу.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Имэйл хаяг</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tany@mail.mn"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(error)}
                className="h-9"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Нууц үг</Label>
                <a
                  href="#"
                  className="text-xs/relaxed text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Нууц үгээ мартсан уу?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(error)}
                  className="h-9 pr-9"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={
                    showPassword ? 'Нууц үгийг нуух' : 'Нууц үгийг харуулах'
                  }
                  className="absolute inset-y-0 right-1.5 my-auto text-muted-foreground"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            {error ? (
              <p role="alert" className="text-xs/relaxed text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="h-9 w-full">
              Нэвтрэх
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

export default LoginPage
