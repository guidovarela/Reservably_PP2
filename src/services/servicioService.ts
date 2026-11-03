import { supabase } from '@/lib/supabase'
import type { Servicio } from '@/types/database'

export async function getServicios(negocioId: string, page = 0, perPage = 20) {
  const from = page * perPage, to = from + perPage - 1
  const { data, error, count } = await supabase
    .from('servicio').select('*', { count: 'exact' })
    .eq('id_negocio', negocioId).eq('activo', true)
    .order('nombre').range(from, to)
  if (error) throw error
  return { data: (data ?? []) as Servicio[], count: count ?? 0 }
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