const express = require('express');
const { getSupabase, getSupabaseAuth } = require('../config/supabase');
const {
  SESSION_COOKIE_NAME: sessionCookie,
  getAdminProfile,
  clearAdminCookie
} = require('../middlewares/auth.middleware');
const { emailPattern, uuidPattern } = require('../middlewares/validate.middleware');
const { databaseErrorMessage, asyncRoute } = require('../middlewares/error.middleware');

const router = express.Router();
const userRoles = ['client', 'staff', 'admin'];

function renderPage(res, options = {}) {
  res.status(options.status || 200).render('users', {
    title: 'Gestión de usuarios',
    admin: options.admin || null,
    users: options.users || [],
    error: options.error || null,
    notice: options.notice || null,
    authConfigured: Boolean(process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY),
    formValues: options.formValues || {}
  });
}

async function loadUsers() {
  const { data, error } = await getSupabase()
    .from('users')
    .select('id, full_name, email, phone, role, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

function getUserInput(body) {
  const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const role = typeof body.role === 'string' ? body.role : '';
  const errors = [];

  if (!fullName) errors.push('El nombre es obligatorio.');
  if (!emailPattern.test(email)) errors.push('Ingresá un email válido.');
  if (body.phone !== undefined && body.phone !== '' && typeof body.phone !== 'string') {
    errors.push('El teléfono debe ser texto.');
  }
  if (!userRoles.includes(role)) errors.push('Seleccioná un rol válido.');

  return {
    errors,
    input: { full_name: fullName, email, phone: phone || null, role }
  };
}


router.get('/', asyncRoute(async (req, res) => {
  const admin = await getAdminProfile(req.cookies[sessionCookie]);
  if (!admin) {
    clearAdminCookie(res);
    return renderPage(res, {
      notice: req.query.notice === 'logged-out' ? 'Sesión cerrada.' : null
    });
  }

  const notices = {
    created: 'Usuario creado.',
    updated: 'Datos del usuario actualizados.',
    deleted: 'Usuario eliminado.',
    'logged-out': 'Sesión cerrada.'
  };
  return renderPage(res, {
    admin,
    users: await loadUsers(),
    notice: notices[req.query.notice] || null
  });
}));

router.post('/login', asyncRoute(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!emailPattern.test(email) || !password) {
    return renderPage(res, { error: 'Ingresá un email y una contraseña válidos.' });
  }

  const { data, error } = await getSupabaseAuth().auth.signInWithPassword({ email, password });
  if (error) {
    if (![400, 401, 403].includes(error.status)) throw error;
    return renderPage(res, { error: 'No se pudo iniciar sesión. Revisá el email y la contraseña.' });
  }

  const admin = await getAdminProfile(data.session.access_token);
  if (!admin) {
    return renderPage(res, {
      status: 403,
      error: 'La cuenta debe tener el rol Administrador en la tabla de usuarios.'
    });
  }

  res.cookie(sessionCookie, data.session.access_token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: (data.session.expires_in || 3600) * 1000,
    path: '/users'
  });
  return res.redirect('/users');
}));

router.post('/logout', (req, res) => {
  clearAdminCookie(res);
  res.redirect('/users?notice=logged-out');
});

router.post('/', asyncRoute(async (req, res) => {
  const admin = await getAdminProfile(req.cookies[sessionCookie]);
  if (!admin) {
    clearAdminCookie(res);
    return res.redirect('/users');
  }

  const { errors, input } = getUserInput(req.body || {});
  if (errors.length) {
    return renderPage(res, {
      admin,
      users: await loadUsers(),
      error: errors.join(' '),
      formValues: req.body
    });
  }

  const { error } = await getSupabase().from('users').insert(input);
  if (error) {
    return renderPage(res, {
      admin,
      users: await loadUsers(),
      error: databaseErrorMessage(error),
      formValues: req.body
    });
  }
  return res.redirect('/users?notice=created');
}));

router.post('/:id/update', asyncRoute(async (req, res) => {
  const admin = await getAdminProfile(req.cookies[sessionCookie]);
  if (!admin) {
    clearAdminCookie(res);
    return res.redirect('/users');
  }
  if (!uuidPattern.test(req.params.id)) {
    return renderPage(res, {
      admin,
      users: await loadUsers(),
      error: 'El identificador del usuario no es válido.'
    });
  }

  const { errors, input } = getUserInput(req.body || {});
  if (errors.length) {
    return renderPage(res, {
      admin,
      users: await loadUsers(),
      error: errors.join(' ')
    });
  }

  const { data, error } = await getSupabase()
    .from('users')
    .update(input)
    .eq('id', req.params.id)
    .select('id')
    .maybeSingle();
  if (error) {
    return renderPage(res, {
      admin,
      users: await loadUsers(),
      error: databaseErrorMessage(error)
    });
  }
  if (!data) {
    return renderPage(res, {
      admin,
      users: await loadUsers(),
      error: 'No se encontró el usuario que intentás modificar.'
    });
  }
  return res.redirect('/users?notice=updated');
}));

router.post('/:id/delete', asyncRoute(async (req, res) => {
  const admin = await getAdminProfile(req.cookies[sessionCookie]);
  if (!admin) {
    clearAdminCookie(res);
    return res.redirect('/users');
  }
  if (!uuidPattern.test(req.params.id)) {
    return renderPage(res, {
      admin,
      users: await loadUsers(),
      error: 'El identificador del usuario no es válido.'
    });
  }

  const { data, error } = await getSupabase()
    .from('users')
    .delete()
    .eq('id', req.params.id)
    .select('id')
    .maybeSingle();
  if (error) {
    return renderPage(res, {
      admin,
      users: await loadUsers(),
      error: databaseErrorMessage(error)
    });
  }
  if (!data) {
    return renderPage(res, {
      admin,
      users: await loadUsers(),
      error: 'No se encontró el usuario que intentás eliminar.'
    });
  }
  return res.redirect('/users?notice=deleted');
}));

module.exports = router;
