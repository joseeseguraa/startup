import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'
import { NuevoCasoDialog } from '@/components/casos/nuevo-caso-dialog'
import { BuscadorCasos } from '@/components/casos/buscador-casos'
import { AccionesCaso } from '@/components/casos/acciones-caso'
import type { Cliente, CasoConCliente } from '@/types'
import Link from 'next/link'

export default async function CasosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { q } = await searchParams
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const serviceClient = await createServiceSupabaseClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const { data: clientes } = await serviceClient
    .from('clientes')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .order('nombre')

  let query = serviceClient
    .from('casos')
    .select('*, clientes(nombre, nif)')
    .eq('tenant_id', profile?.tenant_id)
    .order('created_at', { ascending: false })

  if (q && q.trim() !== '') {
    query = query.ilike('asunto', `%${q}%`)
  }

  const { data: casos } = await query

  const casosAbiertos = casos?.filter(c => c.estado !== 'cerrado') ?? []
  const casosCerrados = casos?.filter(c => c.estado === 'cerrado') ?? []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expedientes y Casos</h1>
          <p className="text-muted-foreground mt-1">Supervisa todos los asuntos legales abiertos y cerrados.</p>
        </div>
        <NuevoCasoDialog clientes={(clientes as Cliente[]) ?? []} />
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
          <div>
            <CardTitle>Todos los Casos</CardTitle>
            <CardDescription>Mostrando {casos?.length ?? 0} expedientes{q ? ` para "${q}"` : ''}.</CardDescription>
          </div>
          <BuscadorCasos defaultValue={q} />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="abiertos" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="abiertos">Activos y Urgentes ({casosAbiertos.length})</TabsTrigger>
              <TabsTrigger value="cerrados">Cerrados ({casosCerrados.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="abiertos">
              <CasosTable casos={casosAbiertos} q={q} clientes={clientes as Cliente[]} />
            </TabsContent>
            <TabsContent value="cerrados">
              <CasosTable casos={casosCerrados} q={q} clientes={clientes as Cliente[]} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function CasosTable({ casos, q, clientes }: { casos: any[], q?: string, clientes: Cliente[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Asunto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>NIF</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Última Gestión</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!casos || casos.length === 0) && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                {q ? `No se encontraron casos para "${q}".` : 'No hay casos en esta categoría.'}
              </TableCell>
            </TableRow>
          )}
          {casos?.map((caso) => (
            <TableRow key={caso.id} className="hover:bg-muted/50 transition-colors cursor-pointer group">
              <TableCell className="font-medium">
                <Link href={`/dashboard/casos/${caso.id}`} className="text-primary hover:underline hover:text-primary/80 transition-colors">
                  {caso.asunto}
                </Link>
              </TableCell>
              <TableCell>
                {(caso.clientes as any)?.nombre ?? 'Desconocido'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {(caso.clientes as any)?.nif ?? '—'}
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
                <AccionesCaso caso={caso as CasoConCliente} clientes={clientes} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
