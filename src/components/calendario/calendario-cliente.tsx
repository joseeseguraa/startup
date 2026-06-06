'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NuevoEventoDialog } from '@/components/calendario/nuevo-evento-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { eliminarEvento } from '@/lib/actions'
import type { Evento } from '@/types'
import Link from 'next/link'

export function CalendarioCliente({ eventos, casos }: { eventos: Evento[], casos: {id: string, asunto: string}[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Filtrar eventos por el día seleccionado
  const eventosDelDia = eventos.filter((evento) => {
    if (!date) return false
    const eventDate = new Date(evento.fecha)
    return (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    )
  })

  // Marcar los días que tienen eventos en el calendario
  const modifiers = {
    hasEvent: eventos.map(e => new Date(e.fecha))
  }
  
  const modifiersStyles = {
    hasEvent: { fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: 'hsl(var(--primary))', textUnderlineOffset: '4px' }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este evento?')) {
      await eliminarEvento(id)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="md:col-span-1 shadow-sm border-muted h-fit">
        <CardContent className="p-4 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2 shadow-sm border-muted">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Agenda del Día</CardTitle>
            <CardDescription>
              {date ? date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Selecciona un día'}
            </CardDescription>
          </div>
          {date && <NuevoEventoDialog selectedDate={date} casos={casos} />}
        </CardHeader>
        <CardContent>
          {!date ? (
            <div className="text-center py-10 text-muted-foreground">Selecciona un día en el calendario para ver los eventos.</div>
          ) : eventosDelDia.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No hay eventos programados para este día.</div>
          ) : (
            <div className="space-y-4">
              {eventosDelDia.map((evento) => (
                <div key={evento.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={
                          evento.tipo === 'juicio' ? 'border-red-500 text-red-600' :
                          evento.tipo === 'reunion' ? 'border-blue-500 text-blue-600' :
                          evento.tipo === 'vencimiento' ? 'border-orange-500 text-orange-600' :
                          'border-gray-500 text-gray-600'
                        }
                      >
                        {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
                      </Badge>
                      <h4 className="font-semibold">
                        {evento.titulo}
                        {evento.caso_id && (
                          <Link href={`/dashboard/casos/${evento.caso_id}`} className="ml-2 text-xs text-primary hover:underline font-normal inline-flex items-center">
                            Ver caso &rarr;
                          </Link>
                        )}
                      </h4>
                    </div>
                    {evento.notas && <p className="text-sm text-muted-foreground mt-2">{evento.notas}</p>}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(evento.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 shrink-0"
                    title="Eliminar evento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
