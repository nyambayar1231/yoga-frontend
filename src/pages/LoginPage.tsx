import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { loginErrorMessage, useLogin } from '@/features/auth/use-login'
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
  const [formError, setFormError] = useState('')

  const login = useLogin()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setFormError('Имэйл хаяг болон нууц үгээ бүрэн оруулна уу.')
      return
    }

    setFormError('')
    login.mutate({ email: email.trim(), password })
  }

  // A client-side complaint wins over a stale error from the previous attempt.
  const errorMessage =
    formError || (login.error ? loginErrorMessage(login.error) : '')

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
                disabled={login.isPending}
                aria-invalid={Boolean(errorMessage)}
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
                  disabled={login.isPending}
                  aria-invalid={Boolean(errorMessage)}
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

            {errorMessage ? (
              <p role="alert" className="text-xs/relaxed text-destructive">
                {errorMessage}
              </p>
            ) : null}

            {login.isSuccess ? (
              <p role="status" className="text-xs/relaxed text-muted-foreground">
                Амжилттай нэвтэрлээ. ({login.data.user.email})
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={login.isPending}
              className="h-9 w-full"
            >
              {login.isPending ? 'Нэвтэрч байна…' : 'Нэвтрэх'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

export default LoginPage
