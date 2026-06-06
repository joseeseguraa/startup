import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutos en ms

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Comprobar inactividad
  if (user) {
    const lastActivity = request.cookies.get('last_activity')?.value
    const now = Date.now()

    if (lastActivity && now - parseInt(lastActivity) > INACTIVITY_TIMEOUT) {
      // Sesión expirada por inactividad — redirigir al login
      const response = NextResponse.redirect(new URL('/login?reason=inactividad', request.url))
      response.cookies.delete('last_activity')
      return response
    }

    // Actualizar timestamp de última actividad
    supabaseResponse.cookies.set('last_activity', now.toString(), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}