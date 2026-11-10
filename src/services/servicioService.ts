import { supabase } from '@/lib/supabase'
import type { Servicio } from '@/types/database'

export async function getServiciosAdmin() {
  const { data, error } = await supabase
    .from('servicio')
    .select('*')
    .order('nombre')
  
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
  const { error } = await supabase
    .from('usuario')
    .update({ 
      estado: 'INACTIVO', 
      desactivado_en: new Date().toISOString()
    })
    .eq('id', id)
    
  if (error) throw error
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
}