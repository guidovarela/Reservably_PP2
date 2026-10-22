const { getSupabase } = require('../config/supabase');

/**
 * Repositorio para operaciones directas con la tabla 'services' en Supabase.
 */
class ServicesRepository {
  async findAll() {
    const { data, error } = await getSupabase()
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findActive() {
    const { data, error } = await getSupabase()
      .from('services')
      .select('id, name, description, price, duration_minutes')
      .eq('active', true)
      .order('name');
    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await getSupabase()
      .from('services')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(serviceData) {
    const { data, error } = await getSupabase()
      .from('services')
      .insert(serviceData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id, serviceData) {
    const { data, error } = await getSupabase()
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { data, error } = await getSupabase()
      .from('services')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}

module.exports = new ServicesRepository();
