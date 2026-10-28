const { getSupabase } = require('../config/supabase');

/**
 * Repositorio para operaciones directas con la tabla 'users' en Supabase.
 */
class UsersRepository {
  async findAll() {
    const { data, error } = await getSupabase()
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findForAdminList() {
    const { data, error } = await getSupabase()
      .from('users')
      .select('id, full_name, email, phone, role, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findStaffMembers() {
    const { data, error } = await getSupabase()
      .from('users')
      .select('id, full_name')
      .eq('role', 'staff')
      .order('full_name');
    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await getSupabase()
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async findByEmail(email) {
    const { data, error } = await getSupabase()
      .from('users')
      .select('id, full_name, email, role')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(userData) {
    const { data, error } = await getSupabase()
      .from('users')
      .insert(userData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id, userData) {
    const { data, error } = await getSupabase()
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { data, error } = await getSupabase()
      .from('users')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}

module.exports = new UsersRepository();
