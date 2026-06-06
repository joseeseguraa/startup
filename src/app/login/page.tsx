'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Scale } from 'lucide-react'

function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const inactividad = searchParams.get('reason') === 'inactividad'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Columna Izquierda - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary/5 border-r p-12 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Scale className="h-6 w-6" />
          </div>
          <span className="font-heading font-semibold text-2xl tracking-tight">LexManager</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-tight text-foreground">
            Gestión inteligente para tu despacho.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Centraliza tus expedientes, agenda y facturación en una plataforma diseñada exclusivamente para profesionales del derecho.
          </p>
        </div>

        <div className="relative z-10 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LexManager. Todos los derechos reservados.
        </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Scale className="h-5 w-5" />
            </div>
            <span className="font-heading font-semibold text-xl">LexManager</span>
          </div>

          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">Bienvenido</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Introduce tus credenciales para acceder a tu área de trabajo.
            </p>
          </div>

          <div className="mt-8">
            {inactividad && (
              <div className="mb-6 p-3 text-sm text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-md">
                Tu sesión se ha cerrado por inactividad. Por favor, vuelve a iniciar sesión.
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">
                    ¿Has olvidado tu contraseña?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
                {loading ? 'Accediendo...' : 'Acceder a mi cuenta'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPageWrapper() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  )
}