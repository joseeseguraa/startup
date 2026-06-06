'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { editarCaso, eliminarCaso } from '@/lib/actions'
import { casoSchema, type CasoFormData } from '@/lib/validations'
import type { Cliente, CasoConCliente } from '@/types'

export function AccionesCaso({ caso, clientes }: { caso: CasoConCliente; clientes: Cliente[] }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CasoFormData>({
    resolver: zodResolver(casoSchema),
    defaultValues: { 
      asunto: caso.asunto, 
      cliente_id: caso.cliente_id, 
      estado: caso.estado, 
      notas: caso.notas ?? '' 
    }
  })

  const selectedEstado = watch('estado')
  const selectedClienteId = watch('cliente_id')

  function onSubmitEdit(data: CasoFormData) {
    setError(null)
    startTransition(async () => {
      const result = await editarCaso(caso.id, data)
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="cursor-pointer flex w-full items-center gap-2">
            <Pencil className="h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="cursor-pointer flex w-full items-center gap-2 text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { reset(); setError(null) } }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Editar Caso</DialogTitle>
            <DialogDescription>Modifica los datos del expediente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor={`edit-asunto-${caso.id}`}>Asunto *</Label>
              <Input id={`edit-asunto-${caso.id}`} {...register('asunto')} />
              {errors.asunto && <p className="text-xs text-destructive">{errors.asunto.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-cliente-${caso.id}`}>Cliente</Label>
              <Select value={selectedClienteId} onValueChange={(val) => setValue('cliente_id', val, { shouldValidate: true })}>
                <SelectTrigger className={errors.cliente_id ? "border-destructive" : ""}>
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
              {errors.cliente_id && <p className="text-xs text-destructive">{errors.cliente_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-estado-${caso.id}`}>Estado</Label>
              <Select value={selectedEstado} onValueChange={(val: 'activo' | 'urgente' | 'cerrado') => setValue('estado', val, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
              {errors.estado && <p className="text-xs text-destructive">{errors.estado.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-notas-${caso.id}`}>Notas</Label>
              <Textarea id={`edit-notas-${caso.id}`} rows={3} {...register('notas')} />
              {errors.notas && <p className="text-xs text-destructive">{errors.notas.message}</p>}
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
