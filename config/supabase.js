const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '');
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseAuthKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    const error = new Error('Falta configurar SUPABASE_URL o SUPABASE_KEY.');
    error.status = 503;
    throw error;
  }

  return createClient(supabaseUrl, supabaseKey);
}

function getSupabaseAuth() {
  if (!supabaseUrl || !supabaseAuthKey) {
    const error = new Error('Falta configurar SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY.');
    error.status = 503;
    throw error;
  }

  return createClient(supabaseUrl, supabaseAuthKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}

module.exports = { getSupabase, getSupabaseAuth };
