'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { crearActuacion } from '@/lib/actions'
import { Loader2 } from 'lucide-react'

export function NuevaActuacionForm({ caso_id }: { caso_id: string }) {
  const [isPending, startTransition] = useTransition()
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!descripcion.trim()) return

    setError(null)
    startTransition(async () => {
      const result = await crearActuacion({ caso_id, descripcion })
      if (result.error) {
        setError(result.error)
      } else {
        setDescripcion('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-muted/30 p-4 rounded-lg border">
      <Textarea
        placeholder="Añadir una nota al historial (ej: Enviado correo al procurador...)"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="min-h-[80px] bg-background"
        disabled={isPending}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !descripcion.trim()} size="sm">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Añadir al historial
        </Button>
      </div>
    </form>
  )
}
