'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs() {
  const pathname = usePathname()

  if (!pathname || pathname === '/dashboard') {
    return null // Don't show breadcrumbs on the main dashboard page
  }

  // Remove trailing slash and split
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean)

  const getLabel = (segment: string) => {
    switch (segment) {
      case 'dashboard': return 'Inicio'
      case 'clientes': return 'Clientes'
      case 'casos': return 'Casos'
      case 'calendario': return 'Calendario'
      case 'configuracion': return 'Configuración'
      case 'facturacion': return 'Facturación'
      default:
        // Si parece un UUID o ID, mostramos "..." por defecto
        if (segment.length > 20 || segment.includes('-')) {
          return '...'
        }
        return segment.charAt(0).toUpperCase() + segment.slice(1)
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground bg-muted/20 px-6 py-2 border-b">
      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        const label = getLabel(segment)

        return (
          <div key={path} className="flex items-center">
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <>
                <Link href={path} className="hover:text-foreground transition-colors">
                  {label}
                </Link>
                <ChevronRight className="h-4 w-4 mx-1 opacity-50" />
              </>
            )}
          </div>
        )
      })}
    </nav>
  )
}
