import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
import { CalendarioCliente } from '@/components/calendario/calendario-cliente'
import { redirect } from 'next/navigation'

export default async function CalendarioPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const serviceClient = createServiceSupabaseClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  // Fetch all events for the tenant
  const { data: eventos } = await serviceClient
    .from('eventos')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .order('fecha', { ascending: true })

  const { data: casos } = await serviceClient
    .from('casos')
    .select('id, asunto')
    .eq('tenant_id', profile?.tenant_id)
    .neq('estado', 'cerrado')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
        <p className="text-muted-foreground mt-1">Gestiona tus juicios, reuniones y vencimientos.</p>
      </div>

      <div className="flex-1 min-h-[500px]">
        <CalendarioCliente eventos={eventos || []} casos={casos || []} />
      </div>
    </div>
  )
}
