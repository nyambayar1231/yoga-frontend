import { Loader2 } from 'lucide-react'

/** Shown while the session is being resolved, before we know where to route. */
function RouteFallback() {
  return (
    <div
      role="status"
      className="flex min-h-svh items-center justify-center bg-muted/40"
    >
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
      <span className="sr-only">Хүлээнэ үү…</span>
    </div>
  )
}

export default RouteFallback
