import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Calendar as CalendarIcon, FileText, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

import { NuevaActuacionForm } from '@/components/casos/nueva-actuacion-form'
import { FileUpload } from '@/components/ui/file-upload'
import { DocumentoItem } from '@/components/ui/documento-item'
import { AccionesActuacion } from '@/components/casos/acciones-actuacion' // We will need a delete button or similar for actuacion. Or we can just build it inline.

// Helper for inline delete action
import { eliminarActuacion } from '@/lib/actions'
import { Button } from '@/components/ui/button'

export default async function CasoPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const serviceClient = createServiceSupabaseClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  // 1. Fetch Caso details
  const { data: caso } = await serviceClient
    .from('casos')
    .select(`
      *,
      clientes:cliente_id (id, nombre, nif, email, telefono)
    `)
    .eq('id', params.id)
    .eq('tenant_id', profile?.tenant_id)
    .single()

  if (!caso) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Caso no encontrado</h1>
        <Link href="/dashboard/casos" className="text-primary hover:underline mt-4 inline-block">&larr; Volver a casos</Link>
      </div>
    )
  }

  // 2. Fetch Actuaciones
  const { data: actuaciones } = await serviceClient
    .from('actuaciones')
    .select('*')
    .eq('caso_id', params.id)
    .order('fecha_creacion', { ascending: false })

  // 3. Fetch Eventos
  const { data: eventos } = await serviceClient
    .from('eventos')
    .select('*')
    .eq('caso_id', params.id)
    .order('fecha', { ascending: true })

  // 4. Fetch Documentos
  const { data: documentos } = await serviceClient
    .from('documentos')
    .select('*')
    .eq('caso_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/casos" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a Casos
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{caso.asunto}</h1>
            <Badge 
              variant="outline" 
              className={
                caso.estado === 'activo' ? 'border-green-500 text-green-600' :
                caso.estado === 'urgente' ? 'border-red-500 text-red-600 bg-red-50' :
                'border-gray-500 text-gray-600'
              }
            >
              {caso.estado.toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-lg">
            Cliente: <Link href={`/dashboard/clientes/${caso.clientes?.id}`} className="text-primary hover:underline">{caso.clientes?.nombre}</Link>
            {caso.clientes?.nif && ` (${caso.clientes.nif})`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Detalles e Historial */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Detalles del Asunto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">
                {caso.notas || <span className="text-muted-foreground italic">No hay notas iniciales.</span>}
              </p>
              <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                Apertura: {new Date(caso.created_at).toLocaleDateString('es-ES')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Historial de Actuaciones
              </CardTitle>
              <CardDescription>Registro cronológico de todo lo sucedido en el caso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <NuevaActuacionForm caso_id={caso.id} />

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
                {actuaciones?.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">No hay actuaciones registradas.</p>
                ) : (
                  actuaciones?.map((act, index) => (
                    <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background p-4 rounded-lg border shadow-sm group-hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <time className="text-xs font-medium text-muted-foreground">
                            {formatDistanceToNow(new Date(act.fecha_creacion), { addSuffix: true, locale: es })}
                          </time>
                          <AccionesActuacion id={act.id} caso_id={caso.id} />
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{act.descripcion}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Documentos y Eventos */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Documentos
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload caso_id={caso.id} />
              
              <div className="space-y-2 mt-4">
                {documentos?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                    Ningún documento adjunto.
                  </p>
                ) : (
                  documentos?.map(doc => (
                    <DocumentoItem key={doc.id} documento={doc} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Eventos Vinculados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventos?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                  No hay eventos programados.
                </p>
              ) : (
                <div className="space-y-3">
                  {eventos?.map(evento => (
                    <div key={evento.id} className="p-3 bg-muted/30 border rounded-md">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{evento.titulo}</span>
                        <Badge variant="outline" className="text-[10px] uppercase h-5">{evento.tipo}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(evento.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-center">
                    <Link href="/dashboard/calendario" className="text-xs text-primary hover:underline">
                      Ver en calendario completo &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
