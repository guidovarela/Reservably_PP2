export type RolUsuario = 'cliente' | 'staff' | 'dueno' | 'admin'
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'PENDIENTE' | 'SUSPENDIDO'
export type EstadoTurno = 'pendiente' | 'confirmado' | 'pago_pendiente' | 'completado' | 'cancelado' | 'no_show'
export type EstadoPago = 'pendiente' | 'pagado' | 'reembolsado'

export interface Usuario {
  id: string
  nombre: string
  apellido: string | null
  email: string
  telefono: string | null
  fecha_nacimiento: string | null
  preferencias: string | null
  foto_url: string | null
  rol: RolUsuario
  estado: EstadoUsuario
  desactivado_en: string | null
  fecha_registro: string
  updated_at: string
}

export interface Negocio {
  id: string
  id_dueno: string
  nombre: string
  slug: string
  descripcion: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
  logo_url: string | null
  timezone: string
  moneda: string
  hora_apertura: string
  hora_cierre: string
  dias_laborables: number[]
  duracion_turno_minutos: number
  anticipacion_minima_horas: number
  anticipacion_maxima_dias: number
  politica_cancelacion_horas: number
  max_no_shows_antes_bloqueo: number
  dias_bloqueo_por_no_show: number
  comision_default: number
  activo: boolean
  desactivado_en: string | null
  created_at: string
  updated_at: string
}

export interface Staff {
  id_usuario: string
  id_negocio: string
  descripcion: string | null
  comision_porcentaje: number
  contratado_en: string
  activo: boolean
  desactivado_en: string | null
  created_at: string
}

export interface Servicio {
  id: string
  id_negocio: string
  nombre: string
  descripcion: string | null
  categoria: string | null
  precio: number
  duracion_minutos: number
  imagen_url: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Turno {
  id: string
  id_negocio: string
  id_cliente: string
  id_staff: string
  id_servicio: string
  inicio: string
  fin: string
  estado: EstadoTurno
  precio: number
  comision_porcentaje: number | null
  comision_monto: number | null
  estado_pago: EstadoPago
  metodo_pago: string | null
  notas: string | null
  cancelado_en: string | null
  completado_en: string | null
  created_at: string
  updated_at: string
}

export interface TourUsuario {
  id_usuario: string
  rol: string
  completado: boolean
  version: number
  no_volver_mostrar: boolean
  fecha_completado: string | null
}