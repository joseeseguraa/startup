'use server'

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Helper: obtiene el tenant_id del usuario autenticado.
// Usa el service role client para evitar problemas de RLS en Server Actions.
async function getAuthContext() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user) return { error: `No autenticado: ${authError?.message ?? 'usuario nulo'}` }

  const serviceClient = createServiceSupabaseClient()
  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: `Perfil no encontrado para usuario ${user.id}. Error: ${profileError?.message ?? 'sin datos'}` }
  return { user, tenantId: profile.tenant_id, serviceClient }
}

export async function crearCliente(formData: FormData) {
  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autenticado o perfil no encontrado' }

  const nombre = formData.get('nombre') as string
  const nif = formData.get('nif') as string | null
  const email = formData.get('email') as string | null
  const telefono = formData.get('telefono') as string | null
  const notas = formData.get('notas') as string | null

  if (!nombre || nombre.trim() === '') {
    return { error: 'El nombre es obligatorio' }
  }

  const { error } = await ctx.serviceClient
    .from('clientes')
    .insert({
      tenant_id: ctx.tenantId,
      nombre: nombre.trim(),
      nif: nif?.trim() || null,
      email: email?.trim() || null,
      telefono: telefono?.trim() || null,
      notas: notas?.trim() || null,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/clientes')
  return { success: true }
}

export async function crearCaso(formData: FormData) {
  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autenticado o perfil no encontrado' }

  const asunto = formData.get('asunto') as string
  const cliente_id = formData.get('cliente_id') as string
  const estado = (formData.get('estado') as string) || 'activo'
  const notas = formData.get('notas') as string | null

  if (!asunto || asunto.trim() === '') {
    return { error: 'El asunto es obligatorio' }
  }
  if (!cliente_id) {
    return { error: 'Debes seleccionar un cliente' }
  }

  const { error } = await ctx.serviceClient
    .from('casos')
    .insert({
      tenant_id: ctx.tenantId,
      cliente_id,
      asunto: asunto.trim(),
      estado,
      notas: notas?.trim() || null,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/casos')
  return { success: true }
}

export async function editarCliente(id: string, formData: FormData) {
  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autenticado o perfil no encontrado' }

  const nombre = formData.get('nombre') as string
  if (!nombre || nombre.trim() === '') {
    return { error: 'El nombre es obligatorio' }
  }

  const { error } = await ctx.serviceClient
    .from('clientes')
    .update({
      nombre: nombre.trim(),
      nif: (formData.get('nif') as string)?.trim() || null,
      email: (formData.get('email') as string)?.trim() || null,
      telefono: (formData.get('telefono') as string)?.trim() || null,
      notas: (formData.get('notas') as string)?.trim() || null,
    })
    .eq('id', id)
    .eq('tenant_id', ctx.tenantId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/clientes')
  return { success: true }
}

export async function eliminarCliente(id: string) {
  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autenticado o perfil no encontrado' }

  const { error } = await ctx.serviceClient
    .from('clientes')
    .delete()
    .eq('id', id)
    .eq('tenant_id', ctx.tenantId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/clientes')
  return { success: true }
}

export async function editarCaso(id: string, formData: FormData) {
  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autenticado o perfil no encontrado' }

  const asunto = formData.get('asunto') as string
  if (!asunto || asunto.trim() === '') {
    return { error: 'El asunto es obligatorio' }
  }

  const { error } = await ctx.serviceClient
    .from('casos')
    .update({
      asunto: asunto.trim(),
      cliente_id: formData.get('cliente_id') as string,
      estado: (formData.get('estado') as string) || 'activo',
      notas: (formData.get('notas') as string)?.trim() || null,
      ultima_gestion: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('tenant_id', ctx.tenantId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/casos')
  return { success: true }
}

export async function eliminarCaso(id: string) {
  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autenticado o perfil no encontrado' }

  const { error } = await ctx.serviceClient
    .from('casos')
    .delete()
    .eq('id', id)
    .eq('tenant_id', ctx.tenantId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/casos')
  return { success: true }
}
