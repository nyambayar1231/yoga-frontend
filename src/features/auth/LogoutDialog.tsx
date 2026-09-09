import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  isError: boolean
  onConfirm: () => void
}

function LogoutDialog({
  open,
  onOpenChange,
  isPending,
  isError,
  onConfirm,
}: LogoutDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Системээс гарах</AlertDialogTitle>
          <AlertDialogDescription>
            Та системээс гарахдаа итгэлтэй байна уу?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isError ? (
          <p role="alert" className="text-xs/relaxed text-destructive">
            Гарах үед алдаа гарлаа. Дараа дахин оролдоно уу.
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Болих</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Гарч байна…' : 'Гарах'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default LogoutDialog
