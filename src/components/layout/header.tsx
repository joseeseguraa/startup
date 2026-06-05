'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function Header() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur px-6 transition-all">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar casos, clientes o documentos..."
            className="w-full bg-muted/50 pl-9 border-none shadow-none focus-visible:ring-1 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-all">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="h-8 w-px bg-border mx-2" />
        <Button onClick={handleLogout} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-all">
          <LogOut className="h-4 w-4 mr-2" />
          Salir
        </Button>
      </div>
    </header>
  )
}
