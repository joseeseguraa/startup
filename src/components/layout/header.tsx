'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { LogOut, Sun, Moon } from 'lucide-react'
import { GlobalSearch } from '@/components/layout/global-search'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur px-6">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-md hidden md:block">
            <GlobalSearch />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>
          <div className="h-8 w-px bg-border mx-1" />
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>
      <Breadcrumbs />
    </div>
  )
}