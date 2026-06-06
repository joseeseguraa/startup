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
import { crearEvento } from '@/lib/actions'
import { eventoSchema, type EventoFormData } from '@/lib/validations'

export function NuevoEventoDialog({ selectedDate, casos, preselectedCasoId }: { selectedDate: Date, casos: {id: string, asunto: string}[], preselectedCasoId?: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Format date for the input (YYYY-MM-DD)
  const dateStr = selectedDate.toISOString().split('T')[0]

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
    defaultValues: { titulo: '', fecha: dateStr, tipo: 'reunion', notas: '', caso_id: preselectedCasoId || '' }
  })

  const selectedTipo = watch('tipo')
  const selectedCaso = watch('caso_id')

  function onSubmit(data: EventoFormData) {
    setError(null)
    startTransition(async () => {
      const result = await crearEvento(data)
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
      reset({ titulo: '', fecha: dateStr, tipo: 'reunion', notas: '', caso_id: preselectedCasoId || '' })
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="transition-all hover:-translate-y-0.5 shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Añadir Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Añadir a la Agenda</DialogTitle>
          <DialogDescription>Programa un nuevo evento para el {selectedDate.toLocaleDateString('es-ES')}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" placeholder="Ej: Juicio Familia Smith" {...register('titulo')} />
            {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Evento</Label>
            <Select value={selectedTipo} onValueChange={(val: 'juicio' | 'reunion' | 'vencimiento' | 'otro') => setValue('tipo', val, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="juicio">Juicio</SelectItem>
                <SelectItem value="reunion">Reunión</SelectItem>
                <SelectItem value="vencimiento">Vencimiento</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-xs text-destructive">{errors.tipo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="caso_id">Asociar a un Caso (Opcional)</Label>
            <Select value={selectedCaso || 'none'} onValueChange={(val) => setValue('caso_id', val === 'none' ? undefined : val, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {casos.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.asunto}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.caso_id && <p className="text-xs text-destructive">{errors.caso_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas adicionales</Label>
            <Textarea id="notas" placeholder="Sala, documentos necesarios, enlaces..." rows={3} {...register('notas')} />
            {errors.notas && <p className="text-xs text-destructive">{errors.notas.message}</p>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
