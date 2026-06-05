'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { editarCaso, eliminarCaso } from '@/lib/actions'
import type { Cliente, CasoConCliente } from '@/types'

export function AccionesCaso({ caso, clientes }: { caso: CasoConCliente; clientes: Cliente[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleEdit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await editarCaso(caso.id, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setEditOpen(false)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await eliminarCaso(caso.id)
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
            <DialogTitle>Editar Caso</DialogTitle>
            <DialogDescription>Modifica los datos del expediente.</DialogDescription>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor={`edit-asunto-${caso.id}`}>Asunto *</Label>
              <Input id={`edit-asunto-${caso.id}`} name="asunto" defaultValue={caso.asunto} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-cliente-${caso.id}`}>Cliente</Label>
              <Select name="cliente_id" defaultValue={caso.cliente_id}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.nif ? `(${cliente.nif})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-estado-${caso.id}`}>Estado</Label>
              <Select name="estado" defaultValue={caso.estado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-notas-${caso.id}`}>Notas</Label>
              <Textarea id={`edit-notas-${caso.id}`} name="notas" defaultValue={caso.notas ?? ''} rows={3} />
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
            <DialogTitle>Eliminar Caso</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar el caso <strong>&quot;{caso.asunto}&quot;</strong>? Esta acción no se puede deshacer.
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
