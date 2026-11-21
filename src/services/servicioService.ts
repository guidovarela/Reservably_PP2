import { supabase } from '@/lib/supabase'
import type { Servicio } from '@/types/database'

const BUCKET_IMAGENES = 'assets'
const EXTENSIONES_IMAGEN: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function subirImagenServicio(file: File, negocioId: string) {
  const extension = EXTENSIONES_IMAGEN[file.type]
  if (!extension) throw new Error('La imagen debe ser JPG, PNG, WEBP o GIF.')
  if (file.size > 5 * 1024 * 1024) throw new Error('La imagen no puede superar los 5 MB.')

  const path = `${negocioId}/servicios/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage
    .from(BUCKET_IMAGENES)
    .upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false })

  if (error) throw error
  const { data } = supabase.storage.from(BUCKET_IMAGENES).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

export async function eliminarImagenServicio(path: string) {
  const { error } = await supabase.storage.from(BUCKET_IMAGENES).remove([path])
  if (error) throw error
}

export async function getServiciosAdmin(negocioId?: string | unknown) {
  let query = supabase
    .from('servicio')
    .select('*')

  if (typeof negocioId === 'string' && negocioId.trim()) {
    query = query.eq('id_negocio', negocioId)
  }

  const { data, error } = await query.order('nombre')
  
  if (error) throw error
  return (data ?? []) as Servicio[]
}

export async function getServiciosLanding() {
  const { data, error } = await supabase
    .from('servicio')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  
  if (error) throw error
  return (data ?? []) as Servicio[]
}

export async function getServiciosParaReserva(negocioId?: string) {
  let query = supabase
    .from('servicio')
    .select('*')
    .eq('activo', true)

  if (negocioId && negocioId.trim()) {
    query = query.eq('id_negocio', negocioId)
  }

  const { data, error } = await query.order('nombre')

  if (error) throw error
  return (data ?? []) as Servicio[]
}

export async function crearServicio(input: Omit<Servicio, 'id' | 'created_at' | 'updated_at' | 'activo'>) {
  const { data, error } = await supabase.from('servicio').insert({ ...input, activo: true }).select().single()
  if (error) throw error
  return data as Servicio
}

export async function desactivarServicio(id: string) {
  const { error } = await supabase.from('servicio').update({ activo: false }).eq('id', id)
  if (error) throw error
}

export async function activarServicio(id: string) {
  const { error } = await supabase.from('servicio').update({ activo: true }).eq('id', id)
  if (error) throw error
}

export async function getStaffMembers() {
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('rol', 'staff')
    .order('nombre')
  
  if (error) throw error
  return data ?? []
}

export async function desactivarStaff(id: string) {
  const ahora = new Date().toISOString()
  const { error } = await supabase
    .from('usuario')
    .update({ 
      estado: 'INACTIVO', 
      desactivado_en: ahora
    })
    .eq('id', id)
    
  if (error) throw error

  const { error: staffError } = await supabase
    .from('staff')
    .update({ activo: false, desactivado_en: ahora })
    .eq('id_usuario', id)

  if (staffError) throw staffError
}

export async function activarStaff(id: string) {
  const { error } = await supabase
    .from('usuario')
    .update({ 
      estado: 'ACTIVO', 
      desactivado_en: null
    })
    .eq('id', id)
    
  if (error) throw error

  const { error: staffError } = await supabase
    .from('staff')
    .update({ activo: true, desactivado_en: null })
    .eq('id_usuario', id)

  if (staffError) throw staffError
}
