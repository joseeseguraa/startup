import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center px-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground mb-4">
        <FileQuestion className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight mb-2">Recurso no encontrado</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        No hemos podido encontrar lo que buscabas dentro del sistema.
      </p>
      <Button asChild variant="outline">
        <Link href="/dashboard">Volver al panel principal</Link>
      </Button>
    </div>
  )
}
