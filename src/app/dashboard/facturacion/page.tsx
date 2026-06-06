import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Download, Filter } from 'lucide-react'

// Datos de prueba temporales
const FACTURAS = [
  { id: 'F2023-001', cliente: 'Juan García Pérez', fecha: '2023-10-15', importe: '1.200,00 €', estado: 'pagada' },
  { id: 'F2023-002', cliente: 'María López S.L.', fecha: '2023-10-18', importe: '850,50 €', estado: 'pendiente' },
  { id: 'F2023-003', cliente: 'Comunidad Propietarios', fecha: '2023-09-01', importe: '450,00 €', estado: 'vencida' },
  { id: 'F2023-004', cliente: 'Antonio Ruiz', fecha: '2023-10-22', importe: '2.100,00 €', estado: 'borrador' },
]

export default function FacturacionPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted-foreground mt-1">Gestiona las facturas y pagos de tus clientes.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Factura
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendiente de cobro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.300,50 €</div>
            <p className="text-xs text-muted-foreground mt-1">2 facturas pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cobrado este mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.450,00 €</div>
            <p className="text-xs text-muted-foreground mt-1">+15% respecto al mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Facturas vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">450,00 €</div>
            <p className="text-xs text-muted-foreground mt-1">1 factura atrasada</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Facturas</CardTitle>
          <CardDescription>
            Listado de las últimas facturas emitidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Importe</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FACTURAS.map((factura) => (
                <TableRow key={factura.id}>
                  <TableCell className="font-medium">{factura.id}</TableCell>
                  <TableCell>{factura.cliente}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(factura.fecha).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>{factura.importe}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        factura.estado === 'pagada' ? 'border-emerald-500 text-emerald-600' :
                        factura.estado === 'pendiente' ? 'border-amber-500 text-amber-600' :
                        factura.estado === 'vencida' ? 'border-destructive text-destructive' :
                        'border-muted-foreground text-muted-foreground'
                      }
                    >
                      {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Descargar PDF">
                      <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
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
