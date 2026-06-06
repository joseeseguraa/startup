'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { crearCaso } from '@/lib/actions'
import { casoSchema, type CasoFormData } from '@/lib/validations'
import type { Cliente } from '@/types'

export function NuevoCasoDialog({ clientes }: { clientes: Cliente[] }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Use only one array, maybe pre-select if there's exactly 1 client passed, otherwise empty string
  const initialClienteId = clientes.length === 1 ? clientes[0].id : ''

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CasoFormData>({
    resolver: zodResolver(casoSchema),
    defaultValues: { asunto: '', cliente_id: initialClienteId, estado: 'activo', notas: '' }
  })

  const selectedEstado = watch('estado')
  const selectedClienteId = watch('cliente_id')

  function onSubmit(data: CasoFormData) {
    setError(null)
    startTransition(async () => {
      const result = await crearCaso(data)
      if (result.error) {
        setError(result.error)
      } else {
        reset()
        setOpen(false)
      }
    })
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (!newOpen) {
      reset({ asunto: '', cliente_id: initialClienteId, estado: 'activo', notas: '' })
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="transition-all hover:-translate-y-0.5 shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Caso
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Nuevo Expediente</DialogTitle>
          <DialogDescription>Abre un nuevo asunto legal asociándolo a un cliente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="asunto">Asunto *</Label>
            <Input id="asunto" placeholder="Ej: Divorcio de mutuo acuerdo" {...register('asunto')} />
            {errors.asunto && <p className="text-xs text-destructive">{errors.asunto.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cliente_id">Cliente *</Label>
            <Select value={selectedClienteId} onValueChange={(val) => setValue('cliente_id', val, { shouldValidate: true })}>
              <SelectTrigger className={errors.cliente_id ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.length === 0 ? (
                  <SelectItem value="empty" disabled>No hay clientes disponibles</SelectItem>
                ) : (
                  clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.nif ? `(${cliente.nif})` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.cliente_id && <p className="text-xs text-destructive">{errors.cliente_id.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado inicial</Label>
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
            <Label htmlFor="notas">Notas iniciales</Label>
            <Textarea id="notas" placeholder="Resumen del caso, próximos pasos..." rows={3} {...register('notas')} />
            {errors.notas && <p className="text-xs text-destructive">{errors.notas.message}</p>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending || clientes.length === 0}>
              {isPending ? 'Guardando...' : 'Crear Caso'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
