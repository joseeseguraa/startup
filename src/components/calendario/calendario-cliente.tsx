'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NuevoEventoDialog } from '@/components/calendario/nuevo-evento-dialog'
import { Trash2, ChevronLeft, ChevronRight, Gavel, Users, Clock, CalendarDays } from 'lucide-react'
import { eliminarEvento } from '@/lib/actions'
import type { Evento } from '@/types'
import Link from 'next/link'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const TIPO_CONFIG: Record<string, { icon: typeof Gavel; color: string; bg: string; border: string; label: string }> = {
  juicio:      { icon: Gavel,        color: 'text-red-600',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    label: 'Juicio' },
  reunion:     { icon: Users,        color: 'text-blue-600',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   label: 'Reunión' },
  vencimiento: { icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  label: 'Vencimiento' },
  otro:        { icon: CalendarDays, color: 'text-slate-600',  bg: 'bg-slate-500/10',  border: 'border-slate-500/30',  label: 'Otro' },
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Lunes = 0
}

export function CalendarioCliente({ eventos, casos }: { eventos: Evento[]; casos: { id: string; asunto: string }[] }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<Date>(today)

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  // Index de eventos por fecha para acceso rápido
  const eventosPorFecha = useMemo(() => {
    const map: Record<string, Evento[]> = {}
    eventos.forEach((e) => {
      const key = e.fecha.split('T')[0]
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return map
  }, [eventos])

  const eventosDelDia = useMemo(() => {
    const key = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    return eventosPorFecha[key] || []
  }, [selectedDate, eventosPorFecha])

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  function goToday() {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDate(today)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este evento?')) {
      await eliminarEvento(id)
    }
  }

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  const isSelected = (day: number) =>
    day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear()

  function getEventosForDay(day: number) {
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return eventosPorFecha[key] || []
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Calendario */}
      <Card className="lg:col-span-2 shadow-sm border-muted flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[180px] text-center">
              {MESES[currentMonth]} {currentYear}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToday} className="text-xs text-muted-foreground hover:text-foreground ml-1">
              Hoy
            </Button>
          </div>
          <NuevoEventoDialog selectedDate={selectedDate} casos={casos} />
        </CardHeader>
        <CardContent className="flex-1 pt-2">
          {/* Cabecera días */}
          <div className="grid grid-cols-7 mb-1">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                {d}
              </div>
            ))}
          </div>
          {/* Cuadrícula de días */}
          <div className="grid grid-cols-7 border-t border-l">
            {/* Días vacíos antes del primer día */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r bg-muted/20 min-h-[80px]" />
            ))}
            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayEvents = getEventosForDay(day)
              const selected = isSelected(day)
              const todayDay = isToday(day)

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                  className={`border-b border-r min-h-[80px] p-1.5 text-left transition-colors hover:bg-accent/50 flex flex-col
                    ${selected ? 'bg-primary/5 ring-2 ring-primary/30 ring-inset' : ''}
                    ${todayDay && !selected ? 'bg-accent/30' : ''}
                  `}
                >
                  <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full
                    ${todayDay ? 'bg-primary text-primary-foreground' : 'text-foreground'}
                  `}>
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const cfg = TIPO_CONFIG[ev.tipo] || TIPO_CONFIG.otro
                      return (
                        <div key={ev.id} className={`text-[10px] leading-tight truncate rounded px-1 py-0.5 ${cfg.bg} ${cfg.color}`}>
                          {ev.titulo}
                        </div>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 2} más</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Panel lateral - Agenda del día */}
      <Card className="lg:col-span-1 shadow-sm border-muted flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Agenda del Día</CardTitle>
          <CardDescription className="capitalize">
            {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {eventosDelDia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No hay eventos para este día.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Selecciona otro día o crea un evento nuevo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventosDelDia.map((evento) => {
                const cfg = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.otro
                const Icon = cfg.icon
                return (
                  <div
                    key={evento.id}
                    className={`relative rounded-lg border p-3 transition-all hover:shadow-sm group ${cfg.border} ${cfg.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-md p-1.5 ${cfg.bg} ${cfg.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.border} ${cfg.color} shadow-none`}>
                            {cfg.label}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm leading-snug">{evento.titulo}</h4>
                        {evento.notas && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{evento.notas}</p>
                        )}
                        {evento.caso_id && (
                          <Link
                            href={`/dashboard/casos/${evento.caso_id}`}
                            className="inline-flex items-center text-[11px] text-primary hover:underline mt-1.5"
                          >
                            Ver expediente →
                          </Link>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(evento.id)}
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 shrink-0"
                        title="Eliminar evento"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
