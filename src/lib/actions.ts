'use server'

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { clienteSchema, casoSchema, eventoSchema, actuacionSchema, type ClienteFormData, type CasoFormData, type EventoFormData, type ActuacionFormData } from '@/lib/validations'

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

export async function crearCliente(data: ClienteFormData) {
  const ctx = await getAuthContext()
  if ('error' in ctx) return { error: ctx.error }

  const parsed = clienteSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Datos de cliente inválidos' }
  }

  const { nombre, nif, email, telefono, notas } = parsed.data

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

export async function crearCaso(data: CasoFormData) {
  const ctx = await getAuthContext()
  if ('error' in ctx) return { error: ctx.error }

  const parsed = casoSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Datos de caso inválidos' }
  }

  const { asunto, cliente_id, estado, notas } = parsed.data

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

export async function editarCliente(id: string, data: ClienteFormData) {
  const ctx = await getAuthContext()
  if ('error' in ctx) return { error: ctx.error }

  const parsed = clienteSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Datos de cliente inválidos' }
  }

  const { nombre, nif, email, telefono, notas } = parsed.data

  const { error } = await ctx.serviceClient
    .from('clientes')
    .update({
      nombre: nombre.trim(),
      nif: nif?.trim() || null,
      email: email?.trim() || null,
      telefono: telefono?.trim() || null,
      notas: notas?.trim() || null,
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
  if ('error' in ctx) return { error: ctx.error }

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

export async function editarCaso(id: string, data: CasoFormData) {
  const ctx = await getAuthContext()
  if ('error' in ctx) return { error: ctx.error }

  const parsed = casoSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Datos de caso inválidos' }
  }

  const { asunto, cliente_id, estado, notas } = parsed.data

  const { error } = await ctx.serviceClient
    .from('casos')
    .update({
      asunto: asunto.trim(),
      cliente_id,
      estado,
      notas: notas?.trim() || null,
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
  if ('error' in ctx) return { error: ctx.error }

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

export async function buscarGlobal(query: string) {
  const ctx = await getAuthContext()
  if ('error' in ctx) return { error: ctx.error, clientes: [], casos: [] }

  const safeQuery = query.replace(/,/g, ' ').trim()
  if (!safeQuery) return { clientes: [], casos: [] }
  
  const q = `%${safeQuery}%`

  const [resClientes, resCasos] = await Promise.all([
    ctx.serviceClient
      .from('clientes')
      .select('id, nombre, nif')
      .eq('tenant_id', ctx.tenantId)
      .or(`nombre.ilike.${q},nif.ilike.${q}`)
      .limit(5),
    ctx.serviceClient
      .from('casos')
      .select('id, asunto')
      .eq('tenant_id', ctx.tenantId)
      .ilike('asunto', q)
      .limit(5)
  ])

  return {
    clientes: resClientes.data || [],
    casos: resCasos.data || [],
  }
}

export async function crearEvento(data: EventoFormData) {
  const ctx = await getAuthContext()
  if ('error' in ctx) return { error: ctx.error }

  const parsed = eventoSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Datos de evento inválidos' }
  }

  const { titulo, fecha, tipo, notas, caso_id } = parsed.data

  const { error } = await ctx.serviceClient
    .from('eventos')
    .insert({
      tenant_id: ctx.tenantId,
      caso_id: caso_id || null,
      titulo: titulo.trim(),
      fecha,
      tipo,
      notas: notas?.trim() || null,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/calendario')
  return { success: true }
}

export async function eliminarEvento(id: string) {
  const ctx = await getAuthContext()
  if ('error' in ctx) return { error: ctx.error }

  const { error } = await ctx.serviceClient
    .from('eventos')
    .delete()
    .eq('id', id)
    .eq('tenant_id', ctx.tenantId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/calendario')
  return { success: true }
}

export async function crearActuacion(data: ActuacionFormData) {
  const ctx = await getAuthContext()
  if ('error' in ctx) return { error: ctx.error }

  const parsed = actuacionSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Datos de actuación inválidos' }
  }

  const { descripcion, caso_id } = parsed.data

  const { error } = await ctx.serviceClient
    .from('actuaciones')
    .insert({
      tenant_id: ctx.tenantId,
      caso_id,
      descripcion: descripcion.trim(),
    })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/casos/${caso_id}`)
  return { success: true }
}

export async function eliminarActuacion(id: string, caso_id: string) {
  const ctx = await getAuthContext()
  if ('error' in ctx) return { error: ctx.error }

  const { error } = await ctx.serviceClient
    .from('actuaciones')
    .delete()
    .eq('id', id)
    .eq('tenant_id', ctx.tenantId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/casos/${caso_id}`)
  return { success: true }
}

export async function subirDocumento(formData: FormData) {
  const ctx = await getAuthContext()
  if ('error' in ctx) return { error: ctx.error }

  const file = formData.get('file') as File | null
  const caso_id = formData.get('caso_id') as string | null
  const cliente_id = formData.get('cliente_id') as string | null

  if (!file) return { error: 'No se ha adjuntado ningún archivo' }
  if (!caso_id && !cliente_id) return { error: 'El documento debe estar asociado a un cliente o caso' }

  // 1. Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const filePath = `${ctx.tenantId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

  const { error: uploadError } = await ctx.serviceClient.storage
    .from('documentos')
    .upload(filePath, file)

  if (uploadError) return { error: 'Error subiendo el archivo: ' + uploadError.message }

  // 2. Insert metadata into documentos table
  const { error: dbError } = await ctx.serviceClient
    .from('documentos')
    .insert({
      tenant_id: ctx.tenantId,
      caso_id: caso_id || null,
      cliente_id: cliente_id || null,
      nombre_archivo: file.name,
      ruta_archivo: filePath,
      tamaño: file.size,
      tipo_mime: file.type,
    })

  if (dbError) {
    // Attempt to delete uploaded file if db insert fails
    await ctx.serviceClient.storage.from('documentos').remove([filePath])
    return { error: 'Error guardando metadatos: ' + dbError.message }
  }

  if (caso_id) revalidatePath(`/dashboard/casos/${caso_id}`)
  if (cliente_id) revalidatePath(`/dashboard/clientes/${cliente_id}`)
  return { success: true }
}

export async function eliminarDocumento(id: string, ruta_archivo: string, caso_id?: string, cliente_id?: string) {
  const ctx = await getAuthContext()
  if ('error' in ctx) return { error: ctx.error }

  // 1. Remove from Storage
  await ctx.serviceClient.storage.from('documentos').remove([ruta_archivo])

  // 2. Remove from DB
  const { error } = await ctx.serviceClient
    .from('documentos')
    .delete()
    .eq('id', id)
    .eq('tenant_id', ctx.tenantId)

  if (error) return { error: error.message }

  if (caso_id) revalidatePath(`/dashboard/casos/${caso_id}`)
  if (cliente_id) revalidatePath(`/dashboard/clientes/${cliente_id}`)
  return { success: true }
}
