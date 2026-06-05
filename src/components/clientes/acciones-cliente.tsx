'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { editarCliente, eliminarCliente } from '@/lib/actions'
import type { Cliente } from '@/types'

export function AccionesCliente({ cliente }: { cliente: Cliente }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleEdit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await editarCliente(cliente.id, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setEditOpen(false)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await eliminarCliente(cliente.id)
      if (result.error) {
        setError(result.error)
      } else {
        setDeleteOpen(false)
      }
    })
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-50 w-36 rounded-md border bg-popover p-1 shadow-md animate-in fade-in zoom-in-95">
            <button
              onClick={() => { setMenuOpen(false); setEditOpen(true) }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar
            </button>
            <button
              onClick={() => { setMenuOpen(false); setDeleteOpen(true) }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </button>
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>Modifica los datos de {cliente.nombre}.</DialogDescription>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor={`edit-nombre-${cliente.id}`}>Nombre / Razón Social *</Label>
              <Input id={`edit-nombre-${cliente.id}`} name="nombre" defaultValue={cliente.nombre} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`edit-nif-${cliente.id}`}>NIF / CIF</Label>
                <Input id={`edit-nif-${cliente.id}`} name="nif" defaultValue={cliente.nif ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edit-telefono-${cliente.id}`}>Teléfono</Label>
                <Input id={`edit-telefono-${cliente.id}`} name="telefono" defaultValue={cliente.telefono ?? ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-email-${cliente.id}`}>Email</Label>
              <Input id={`edit-email-${cliente.id}`} name="email" type="email" defaultValue={cliente.email ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-notas-${cliente.id}`}>Notas</Label>
              <Textarea id={`edit-notas-${cliente.id}`} name="notas" defaultValue={cliente.notas ?? ''} rows={3} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar Cliente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar a <strong>{cliente.nombre}</strong>? Esta acción no se puede deshacer y eliminará también todos los casos asociados.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
