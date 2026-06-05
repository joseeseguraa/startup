export type Tenant = {
  id: string
  nombre: string
  created_at: string
}

export type Profile = {
  id: string
  tenant_id: string
  nombre: string
  rol: 'admin' | 'abogado'
  created_at: string
}

export type Cliente = {
  id: string
  tenant_id: string
  nombre: string
  nif: string | null
  telefono: string | null
  email: string | null
  carpeta: string | null
  notas: string | null
  created_at: string
}

export type Caso = {
  id: string
  tenant_id: string
  cliente_id: string
  asunto: string
  estado: 'activo' | 'urgente' | 'cerrado'
  ultima_gestion: string | null
  notas: string | null
  created_at: string
}

export type CasoConCliente = Caso & {
  clientes: Pick<Cliente, 'nombre' | 'nif'>
}