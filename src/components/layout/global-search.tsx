'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FolderOpen, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { buscarGlobal } from '@/lib/actions'

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ clientes: any[], casos: any[] }>({ clientes: [], casos: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!query) { setResults({ clientes: [], casos: [] }); return }
    const t = setTimeout(async () => {
      setLoading(true)
      const res = await buscarGlobal(query)
      if (!res.error) setResults({ clientes: res.clientes, casos: res.casos })
      setLoading(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const handleSelect = (url: string) => {
    setOpen(false)
    setQuery('')
    router.push(url)
  }

  const hasResults = results.clientes.length > 0 || results.casos.length > 0

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-64 lg:w-80"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Buscar casos, clientes...</span>
        <span className="inline-flex lg:hidden">Buscar...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery('') }}>
        <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
          <DialogTitle className="sr-only">Búsqueda global</DialogTitle>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <Input
              autoFocus
              placeholder="Buscar clientes, casos, NIF..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 h-12 text-sm"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {loading && (
              <p className="text-sm text-muted-foreground text-center py-6">Buscando...</p>
            )}
            {!loading && query && !hasResults && (
              <p className="text-sm text-muted-foreground text-center py-6">No se encontraron resultados</p>
            )}
            {!query && (
              <p className="text-sm text-muted-foreground text-center py-6">Escribe para buscar</p>
            )}

            {results.clientes.length > 0 && (
              <div className="px-2">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1">Clientes</p>
                {results.clientes.map(cliente => (
                  <button
                    key={cliente.id}
                    onClick={() => handleSelect(`/dashboard/clientes/${cliente.id}`)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{cliente.nombre}</span>
                    {cliente.nif && <span className="text-xs text-muted-foreground ml-auto">{cliente.nif}</span>}
                  </button>
                ))}
              </div>
            )}

            {results.casos.length > 0 && (
              <div className="px-2 mt-2">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1">Casos</p>
                {results.casos.map(caso => (
                  <button
                    key={caso.id}
                    onClick={() => handleSelect(`/dashboard/casos/${caso.id}`)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{caso.asunto}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}