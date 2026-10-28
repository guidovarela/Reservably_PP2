const crypto = require('crypto');
const { getSupabase, getSupabaseAuth } = require('../config/supabase');

const SESSION_COOKIE_NAME = 'barberia_admin_session';

/**
 * Middleware de autenticación para la API REST mediante Bearer Token.
 */
function requireApiToken(req, res, next) {
  const expected = process.env.API_TOKEN;
  const provided = req.get('authorization') || '';
  const match = /^Bearer (.+)$/i.exec(provided);

  if (!expected) {
    return res.status(503).json({ error: 'La API no está configurada: falta API_TOKEN.' });
  }
  if (!match) {
    return res.status(401).json({ error: 'Se requiere Authorization: Bearer <API_TOKEN>.' });
  }

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(match[1]);
  if (expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
    return res.status(401).json({ error: 'Token de acceso inválido.' });
  }

  next();
}

/**
 * Obtiene y valida el perfil del administrador autenticado a partir de su token de Supabase Auth.
 */
async function getAdminProfile(accessToken) {
  if (!accessToken) return null;

  const { data, error } = await getSupabaseAuth().auth.getUser(accessToken);
  if (error) {
    if ([400, 401, 403].includes(error.status)) return null;
    throw error;
  }
  if (!data.user || !data.user.email) return null;

  const { data: profile, error: profileError } = await getSupabase()
    .from('users')
    .select('id, full_name, email, role')
    .eq('email', data.user.email.toLowerCase())
    .maybeSingle();
  if (profileError) throw profileError;

  return profile && profile.role === 'admin' ? profile : null;
}

/**
 * Limpia la cookie de sesión del administrador.
 */
function clearAdminCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/users'
  });
}

/**
 * Middleware para rutas web que requieren sesión activa de administrador.
 */
function requireAdminSession(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  getAdminProfile(token)
    .then((admin) => {
      if (!admin) {
        clearAdminCookie(res);
        return res.redirect('/users');
      }
      req.admin = admin;
      next();
    })
    .catch((err) => next(err));
}

module.exports = {
  SESSION_COOKIE_NAME,
  requireApiToken,
  getAdminProfile,
  clearAdminCookie,
  requireAdminSession
};
