'use client'

import { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { eliminarActuacion } from '@/lib/actions'

export function AccionesActuacion({ id, caso_id }: { id: string, caso_id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar esta nota del historial?')) {
      startTransition(async () => {
        await eliminarActuacion(id, caso_id)
      })
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={isPending}
      title="Eliminar actuación"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
    </Button>
  )
}
