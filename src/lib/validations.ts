import { z } from 'zod'

export const clienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  nif: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.union([z.literal(''), z.string().email('Debe ser un email válido')]).optional().nullable(),
  notas: z.string().optional().nullable(),
})

export type ClienteFormData = z.infer<typeof clienteSchema>

export const casoSchema = z.object({
  asunto: z.string().min(3, 'El asunto debe tener al menos 3 caracteres'),
  cliente_id: z.string().min(1, 'Debes seleccionar un cliente'),
  estado: z.enum(['activo', 'urgente', 'cerrado'], {
    required_error: 'Debes seleccionar un estado',
  }),
  notas: z.string().optional().nullable(),
})

export type CasoFormData = z.infer<typeof casoSchema>

export const eventoSchema = z.object({
  titulo: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  fecha: z.string().min(10, 'La fecha es obligatoria'), // YYYY-MM-DD
  tipo: z.enum(['juicio', 'reunion', 'vencimiento', 'otro'], {
    required_error: 'Debes seleccionar un tipo',
  }),
  notas: z.string().optional().nullable(),
  caso_id: z.string().optional().nullable(),
})

export type EventoFormData = z.infer<typeof eventoSchema>

export const actuacionSchema = z.object({
  descripcion: z.string().min(2, 'La descripción no puede estar vacía'),
  caso_id: z.string().uuid('ID de caso inválido'),
})

export type ActuacionFormData = z.infer<typeof actuacionSchema>

