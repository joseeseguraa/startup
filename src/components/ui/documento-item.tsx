'use client'

import { useState, useTransition } from 'react'
import { FileText, Trash2, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { eliminarDocumento } from '@/lib/actions'
import { createClient } from '@/lib/supabase'

export function DocumentoItem({ 
  documento 
}: { 
  documento: { id: string, nombre_archivo: string, ruta_archivo: string, tamaño: number, caso_id?: string | null, cliente_id?: string | null } 
}) {
  const [isPending, startTransition] = useTransition()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    const supabase = createClient()
    const { data, error } = await supabase.storage.from('documentos').createSignedUrl(documento.ruta_archivo, 60)
    
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    } else {
      alert('Error al descargar el archivo.')
    }
    setIsDownloading(false)
  }

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este documento de forma permanente?')) {
      startTransition(async () => {
        await eliminarDocumento(documento.id, documento.ruta_archivo, documento.caso_id || undefined, documento.cliente_id || undefined)
      })
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-background border rounded-md group hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
          <FileText className="h-4 w-4" />
        </div>
        <div className="truncate">
          <p className="text-sm font-medium truncate" title={documento.nombre_archivo}>
            {documento.nombre_archivo}
          </p>
          <p className="text-xs text-muted-foreground">
            {(documento.tamaño / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />}
        </Button>
      </div>
    </div>
  )
}
