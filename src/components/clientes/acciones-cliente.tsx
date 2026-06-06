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
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { editarCliente, eliminarCliente } from '@/lib/actions'
import { clienteSchema, type ClienteFormData } from '@/lib/validations'
import type { Cliente } from '@/types'

export function AccionesCliente({ cliente, mode }: { cliente: Cliente, mode?: 'edit-only' }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: cliente.nombre,
      nif: cliente.nif ?? '',
      telefono: cliente.telefono ?? '',
      email: cliente.email ?? '',
      notas: cliente.notas ?? ''
    }
  })

  function onSubmitEdit(data: ClienteFormData) {
    setError(null)
    startTransition(async () => {
      const result = await editarCliente(cliente.id, data)
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        setEditOpen(false)
        toast.success('Cliente guardado correctamente')
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await eliminarCliente(cliente.id)
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        setDeleteOpen(false)
        toast.success('Cliente eliminado')
      }
    })
  }

  return (
    <>
      {mode === 'edit-only' ? (
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="flex items-center gap-2">
          <Pencil className="h-4 w-4" />
          Editar datos
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/clientes/${cliente.id}`} className="cursor-pointer flex w-full items-center gap-2">
                <Eye className="h-4 w-4" /> Ver Ficha
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditOpen(true)} className="cursor-pointer flex w-full items-center gap-2">
              <Pencil className="h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="cursor-pointer flex w-full items-center gap-2 text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { reset(); setError(null) } }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>Modifica los datos de {cliente.nombre}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor={`edit-nombre-${cliente.id}`}>Nombre / Razón Social *</Label>
              <Input id={`edit-nombre-${cliente.id}`} {...register('nombre')} />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`edit-nif-${cliente.id}`}>NIF / CIF</Label>
                <Input id={`edit-nif-${cliente.id}`} {...register('nif')} />
                {errors.nif && <p className="text-xs text-destructive">{errors.nif.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edit-telefono-${cliente.id}`}>Teléfono</Label>
                <Input id={`edit-telefono-${cliente.id}`} {...register('telefono')} />
                {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-email-${cliente.id}`}>Email</Label>
              <Input id={`edit-email-${cliente.id}`} type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-notas-${cliente.id}`}>Notas</Label>
              <Textarea id={`edit-notas-${cliente.id}`} rows={3} {...register('notas')} />
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