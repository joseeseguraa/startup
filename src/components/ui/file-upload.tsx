'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UploadCloud, Loader2 } from 'lucide-react'
import { subirDocumento } from '@/lib/actions'

interface FileUploadProps {
  caso_id?: string
  cliente_id?: string
}

export function FileUpload({ caso_id, cliente_id }: FileUploadProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create form data
    const formData = new FormData()
    formData.append('file', file)
    if (caso_id) formData.append('caso_id', caso_id)
    if (cliente_id) formData.append('cliente_id', cliente_id)

    setError(null)
    startTransition(async () => {
      const result = await subirDocumento(formData)
      if (result.error) {
        setError(result.error)
      }
      // Reset the input so the same file can be uploaded again if needed
      e.target.value = ''
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input 
          type="file" 
          id="file-upload" 
          className="sr-only" 
          onChange={handleUpload}
          disabled={isPending}
        />
        <Button 
          variant="outline" 
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
          {isPending ? 'Subiendo...' : 'Subir Documento'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
