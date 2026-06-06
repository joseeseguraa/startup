import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scale } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-8 shadow-sm">
        <Scale className="h-8 w-8" />
      </div>
      <h1 className="font-heading text-8xl md:text-9xl font-bold text-primary/20 tracking-tighter mb-4">404</h1>
      <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-2">Página no encontrada</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        La página que buscas no existe, ha sido movida o no tienes permisos para acceder a ella.
      </p>
      <Button asChild size="lg" className="h-12 px-8">
        <Link href="/dashboard">Volver al inicio</Link>
      </Button>
    </div>
  )
}
