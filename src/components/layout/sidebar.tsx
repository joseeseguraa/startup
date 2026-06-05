'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scale, Users, Briefcase, Calendar, FileText, Settings } from 'lucide-react'

const navigation = [
  { name: 'Inicio', href: '/dashboard', icon: Scale },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Casos', href: '/dashboard/casos', icon: Briefcase },
  { name: 'Calendario', href: '/dashboard/calendario', icon: Calendar },
  { name: 'Facturación', href: '/dashboard/facturacion', icon: FileText },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-md">
      <div className="flex h-16 shrink-0 items-center px-6 border-b">
        <Scale className="h-6 w-6 text-primary mr-2" />
        <span className="font-semibold text-lg tracking-tight">LexManager</span>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
