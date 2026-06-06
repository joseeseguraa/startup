import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, FileText, Calendar, Pencil } from 'lucide-react'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { NuevoCasoDialog } from '@/components/casos/nuevo-caso-dialog'
import { AccionesCaso } from '@/components/casos/acciones-caso'
import { AccionesCliente } from '@/components/clientes/acciones-cliente'
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

  const serviceClient = await createServiceSupabaseClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const { data: cliente } = await serviceClient
    .from('clientes')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', profile?.tenant_id)
    .single()

  if (!cliente) notFound()

  const { data: casos } = await serviceClient
    .from('casos')
    .select('*, clientes(nombre, nif)')
    .eq('cliente_id', id)
    .eq('tenant_id', profile?.tenant_id)
    .order('created_at', { ascending: false })

  const { data: documentos } = await serviceClient
    .from('documentos')
    .select('*')
    .eq('cliente_id', id)
    .eq('tenant_id', profile?.tenant_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/clientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{cliente.nombre}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Ficha del cliente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Datos del cliente */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Datos del cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cliente.nif && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{cliente.nif}</span>
              </div>
            )}
            {cliente.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${cliente.email}`} className="text-sm text-primary hover:underline truncate">{cliente.email}</a>
              </div>
            )}
            {cliente.telefono && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`tel:${cliente.telefono}`} className="text-sm text-primary hover:underline">{cliente.telefono}</a>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Alta: {new Date(cliente.created_at).toLocaleDateString('es-ES')}</span>
            </div>
            {cliente.notas && (
              <div className="pt-3 mt-3 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-1">Notas</p>
                <p className="text-sm whitespace-pre-wrap">{cliente.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Columna derecha — casos y documentos */}
        <div className="lg:col-span-2 space-y-6">

          {/* Casos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Expedientes ({casos?.length ?? 0})</CardTitle>
                <CardDescription className="text-xs mt-0.5">Casos asociados a este cliente</CardDescription>
              </div>
              <NuevoCasoDialog clientes={[cliente as Cliente]} />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Asunto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última gestión</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!casos || casos.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-center text-muted-foreground text-sm">
                        No hay casos asociados todavía
                      </TableCell>
                    </TableRow>
                  )}
                  {casos?.map((caso) => (
                    <TableRow key={caso.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/casos/${caso.id}`} className="text-primary hover:underline">
                          {caso.asunto}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={caso.estado === 'urgente' ? 'destructive' : caso.estado === 'cerrado' ? 'secondary' : 'default'}
                          className={caso.estado === 'activo' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none' : ''}
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
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos ({documentos?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FileUpload cliente_id={cliente.id} />
              {documentos?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                  No hay documentos adjuntos
                </p>
              ) : (
                <div className="space-y-2">
                  {documentos?.map(doc => (
                    <DocumentoItem key={doc.id} documento={doc} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}