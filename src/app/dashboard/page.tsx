import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { NuevoClienteDialog } from '@/components/clientes/nuevo-cliente-dialog'
import { NuevoCasoDialog } from '@/components/casos/nuevo-caso-dialog'
import type { Cliente } from '@/types'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const serviceClient = createServiceSupabaseClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single()

  const { data: clientes } = await serviceClient
    .from('clientes')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .order('created_at', { ascending: false })

  const { data: casos } = await serviceClient
    .from('casos')
    .select('*, clientes(nombre, nif)')
    .eq('tenant_id', profile?.tenant_id)
    .order('created_at', { ascending: false })

  const activos = casos?.filter(c => c.estado === 'activo').length ?? 0
  const urgentes = casos?.filter(c => c.estado === 'urgente').length ?? 0
  const cerrados = casos?.filter(c => c.estado === 'cerrado').length ?? 0

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{(profile?.tenants as {nombre: string} | null)?.nombre ?? 'Despacho de Abogados'}</h1>
          <p className="text-muted-foreground mt-1">Aquí tienes un resumen de tu actividad reciente.</p>
        </div>
        <div className="flex gap-3">
          <NuevoClienteDialog />
          <NuevoCasoDialog clientes={(clientes as Cliente[]) ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-all hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Totales</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clientes?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 este mes</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Casos Activos</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activos}</div>
            <p className="text-xs text-muted-foreground mt-1">En curso</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all hover:border-destructive/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{urgentes}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Casos Cerrados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">{cerrados}</div>
            <p className="text-xs text-muted-foreground mt-1">Histórico</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Casos Recientes</CardTitle>
            <CardDescription>Los últimos expedientes actualizados en el sistema.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-primary hover:text-primary/80">
            <Link href="/dashboard/casos">
              Ver todos <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Asunto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>NIF</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Última Gestión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {casos?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No hay casos registrados todavía.
                  </TableCell>
                </TableRow>
              )}
              {casos?.slice(0, 5).map((caso) => (
                <TableRow key={caso.id} className="group cursor-pointer hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{caso.asunto}</TableCell>
                  <TableCell>{(caso.clientes as any)?.nombre ?? 'Desconocido'}</TableCell>
                  <TableCell className="text-muted-foreground">{(caso.clientes as any)?.nif ?? '—'}</TableCell>
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
                  <TableCell className="text-right text-muted-foreground">
                    {caso.ultima_gestion ? new Date(caso.ultima_gestion).toLocaleDateString('es-ES') : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}