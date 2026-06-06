'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FolderOpen, User } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
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
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!query) {
      setResults({ clientes: [], casos: [] })
      return
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      const res = await buscarGlobal(query)
      if (!res.error) {
        setResults({ clientes: res.clientes, casos: res.casos })
      }
      setLoading(false)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  // Use shouldFilter={false} to let the server handle filtering, 
  // otherwise cmdk will try to filter the already-filtered results locally.

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-64 lg:w-80"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Buscar casos, clientes...</span>
        <span className="inline-flex lg:hidden">Buscar...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput 
          placeholder="Escribe para buscar (ej. un nombre o NIF)..." 
          value={query} 
          onValueChange={setQuery} 
        />
        <CommandList>
          <CommandEmpty>{loading ? 'Buscando...' : query.length > 0 ? 'No se encontraron resultados.' : 'Escribe para empezar a buscar.'}</CommandEmpty>
          
          {results.clientes.length > 0 && (
            <CommandGroup heading="Clientes">
              {results.clientes.map((cliente) => (
                <CommandItem
                  key={`cliente-${cliente.id}`}
                  value={`cliente-${cliente.id}`}
                  onSelect={() => handleSelect(`/dashboard/clientes/${cliente.id}`)}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{cliente.nombre}</span>
                  {cliente.nif && <span className="ml-2 text-xs text-muted-foreground">{cliente.nif}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.casos.length > 0 && (
            <CommandGroup heading="Casos">
              {results.casos.map((caso) => (
                <CommandItem
                  key={`caso-${caso.id}`}
                  value={`caso-${caso.id}`}
                  onSelect={() => handleSelect(`/dashboard/casos?q=${encodeURIComponent(caso.asunto)}`)}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  <span>{caso.asunto}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
