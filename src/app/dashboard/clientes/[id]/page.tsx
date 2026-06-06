import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'
import { NuevoCasoDialog } from '@/components/casos/nuevo-caso-dialog'
import { AccionesCaso } from '@/components/casos/acciones-caso'
import { FileUpload } from '@/components/ui/file-upload'
import { DocumentoItem } from '@/components/ui/documento-item'
import type { Cliente, CasoConCliente } from '@/types'

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const serviceClient = createServiceSupabaseClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  // Fetch cliente
  const { data: cliente } = await serviceClient
    .from('clientes')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', profile?.tenant_id)
    .single()

  if (!cliente) {
    notFound()
  }

  // Fetch casos del cliente
  const { data: casos } = await serviceClient
    .from('casos')
    .select('*, clientes(nombre, nif)')
    .eq('cliente_id', id)
    .eq('tenant_id', profile?.tenant_id)
    .order('created_at', { ascending: false })

  // Fetch documentos del cliente
  const { data: documentos } = await serviceClient
    .from('documentos')
    .select('*')
    .eq('cliente_id', id)
    .eq('tenant_id', profile?.tenant_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{cliente.nombre}</h1>
            <p className="text-muted-foreground mt-1">Ficha detallada del cliente y sus expedientes.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Detalles del Cliente */}
        <Card className="md:col-span-1 shadow-sm border-muted h-fit">
          <CardHeader>
            <CardTitle>Datos del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cliente.nif && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{cliente.nif}</span>
              </div>
            )}
            {cliente.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${cliente.email}`} className="text-sm text-primary hover:underline">{cliente.email}</a>
              </div>
            )}
            {cliente.telefono && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${cliente.telefono}`} className="text-sm text-primary hover:underline">{cliente.telefono}</a>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Alta: {new Date(cliente.created_at).toLocaleDateString('es-ES')}</span>
            </div>
            {cliente.notas && (
              <div className="pt-4 mt-4 border-t border-muted">
                <h4 className="text-sm font-medium mb-2">Notas:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{cliente.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentos del Cliente */}
        <Card className="md:col-span-1 shadow-sm border-muted h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload cliente_id={cliente.id} />
            
            <div className="space-y-2 mt-4">
              {documentos?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                  No hay documentos adjuntos.
                </p>
              ) : (
                documentos?.map(doc => (
                  <DocumentoItem key={doc.id} documento={doc} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Casos del Cliente */}
        <Card className="md:col-span-2 shadow-sm border-muted">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
            <div>
              <CardTitle>Expedientes ({casos?.length ?? 0})</CardTitle>
              <CardDescription>Casos asociados a este cliente.</CardDescription>
            </div>
            <NuevoCasoDialog clientes={[cliente as Cliente]} />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Asunto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última Gestión</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!casos || casos.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Este cliente aún no tiene casos asociados.
                      </TableCell>
                    </TableRow>
                  )}
                  {casos?.map((caso) => (
                    <TableRow key={caso.id} className="hover:bg-muted/50 transition-colors group">
                      <TableCell className="font-medium max-w-[200px] truncate" title={caso.asunto}>
                        {caso.asunto}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            caso.estado === 'activo' ? 'default' : 
                            caso.estado === 'urgente' ? 'destructive' : 'secondary'
                          }
                          className={
                            caso.estado === 'activo' ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 shadow-none' : ''
                          }
                        >
                          {caso.estado.charAt(0).toUpperCase() + caso.estado.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {caso.ultima_gestion ? new Date(caso.ultima_gestion).toLocaleDateString('es-ES') : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <AccionesCaso caso={caso as CasoConCliente} clientes={[cliente as Cliente]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
