import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { redirect } from 'next/navigation'
import { NuevoClienteDialog } from '@/components/clientes/nuevo-cliente-dialog'
import { BuscadorClientes } from '@/components/clientes/buscador-clientes'
import { AccionesCliente } from '@/components/clientes/acciones-cliente'
import type { Cliente } from '@/types'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { q } = await searchParams
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })

  if (q && q.trim() !== '') {
    query = query.or(`nombre.ilike.%${q}%,nif.ilike.%${q}%`)
  }

  const { data: clientes } = await query

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Directorio de Clientes</h1>
          <p className="text-muted-foreground mt-1">Gestiona la información de contacto y detalles de tus clientes.</p>
        </div>
        <NuevoClienteDialog />
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
          <div>
            <CardTitle>Todos los Clientes</CardTitle>
            <CardDescription>Tienes {clientes?.length ?? 0} clientes {q ? `que coinciden con "${q}"` : 'registrados en total'}.</CardDescription>
          </div>
          <BuscadorClientes defaultValue={q} />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nombre / Razón Social</TableHead>
                  <TableHead>NIF / CIF</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Fecha de Alta</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!clientes || clientes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      {q ? `No se encontraron clientes para "${q}".` : 'No se encontraron clientes. Haz clic en "Añadir Cliente" para empezar.'}
                    </TableCell>
                  </TableRow>
                )}
                {clientes?.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                    <TableCell className="font-medium">{cliente.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{cliente.nif ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex flex-col">
                        <span>{cliente.email ?? '—'}</span>
                        <span className="text-xs">{cliente.telefono ?? ''}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('es-ES') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <AccionesCliente cliente={cliente as Cliente} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
