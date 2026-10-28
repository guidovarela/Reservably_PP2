const { getSupabaseAuth } = require('../config/supabase');
const usersService = require('../services/users.service');
const { validateUser, getWebUserInput } = require('../validators/user.validator');
const { emailPattern, uuidPattern, respondWithValidation } = require('../middlewares/validate.middleware');
const {
  SESSION_COOKIE_NAME: sessionCookie,
  getAdminProfile,
  clearAdminCookie
} = require('../middlewares/auth.middleware');
const { sendDatabaseError, databaseErrorMessage } = require('../middlewares/error.middleware');

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

/**
 * Controlador para la gestión de usuarios (API REST y Panel Web).
 */
class UsersController {
  // === ENDPOINTS API REST ===

  async list(req, res) {
    try {
      const data = await usersService.getAllUsers();
      res.json(data);
    } catch (error) {
      return sendDatabaseError(res, error);
    }
  }

  async getById(req, res) {
    try {
      const data = await usersService.getUserById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Registro no encontrado.' });
      res.json(data);
    } catch (error) {
      return sendDatabaseError(res, error);
    }
  }

  async create(req, res) {
    const errors = validateUser(req.body);
    if (respondWithValidation(res, errors)) return;

    try {
      const data = await usersService.createUser(req.body);
      res.status(201).json(data);
    } catch (error) {
      return sendDatabaseError(res, error);
    }
  }

  async update(req, res) {
    const errors = validateUser(req.body, true);
    if (respondWithValidation(res, errors)) return;

    if (!Object.keys(req.body || {}).length) {
      return res.status(400).json({ error: 'Debe enviar al menos un campo para actualizar.' });
    }

    try {
      const data = await usersService.updateUser(req.params.id, req.body);
      if (!data) return res.status(404).json({ error: 'Registro no encontrado.' });
      res.json(data);
    } catch (error) {
      return sendDatabaseError(res, error);
    }
  }

  async remove(req, res) {
    try {
      const data = await usersService.deleteUser(req.params.id);
      if (!data) return res.status(404).json({ error: 'Registro no encontrado.' });
      res.status(204).end();
    } catch (error) {
      return sendDatabaseError(res, error);
    }
  }

  // === ENDPOINTS PANEL WEB SSR (/users) ===

  async renderPanel(req, res) {
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
      users: await usersService.getAdminUsersList(),
      notice: notices[req.query.notice] || null
    });
  }

  async login(req, res) {
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
  }

  logout(req, res) {
    clearAdminCookie(res);
    res.redirect('/users?notice=logged-out');
  }

  async createFromWeb(req, res) {
    const admin = await getAdminProfile(req.cookies[sessionCookie]);
    if (!admin) {
      clearAdminCookie(res);
      return res.redirect('/users');
    }

    const { errors, input } = getWebUserInput(req.body || {});
    if (errors.length) {
      return renderPage(res, {
        admin,
        users: await usersService.getAdminUsersList(),
        error: errors.join(' '),
        formValues: req.body
      });
    }

    try {
      await usersService.createUser(input);
      return res.redirect('/users?notice=created');
    } catch (error) {
      return renderPage(res, {
        admin,
        users: await usersService.getAdminUsersList(),
        error: databaseErrorMessage(error),
        formValues: req.body
      });
    }
  }

  async updateFromWeb(req, res) {
    const admin = await getAdminProfile(req.cookies[sessionCookie]);
    if (!admin) {
      clearAdminCookie(res);
      return res.redirect('/users');
    }
    if (!uuidPattern.test(req.params.id)) {
      return renderPage(res, {
        admin,
        users: await usersService.getAdminUsersList(),
        error: 'El identificador del usuario no es válido.'
      });
    }

    const { errors, input } = getWebUserInput(req.body || {});
    if (errors.length) {
      return renderPage(res, {
        admin,
        users: await usersService.getAdminUsersList(),
        error: errors.join(' ')
      });
    }

    try {
      const data = await usersService.updateUser(req.params.id, input);
      if (!data) {
        return renderPage(res, {
          admin,
          users: await usersService.getAdminUsersList(),
          error: 'No se encontró el usuario que intentás modificar.'
        });
      }
      return res.redirect('/users?notice=updated');
    } catch (error) {
      return renderPage(res, {
        admin,
        users: await usersService.getAdminUsersList(),
        error: databaseErrorMessage(error)
      });
    }
  }

  async deleteFromWeb(req, res) {
    const admin = await getAdminProfile(req.cookies[sessionCookie]);
    if (!admin) {
      clearAdminCookie(res);
      return res.redirect('/users');
    }
    if (!uuidPattern.test(req.params.id)) {
      return renderPage(res, {
        admin,
        users: await usersService.getAdminUsersList(),
        error: 'El identificador del usuario no es válido.'
      });
    }

    try {
      const data = await usersService.deleteUser(req.params.id);
      if (!data) {
        return renderPage(res, {
          admin,
          users: await usersService.getAdminUsersList(),
          error: 'No se encontró el usuario que intentás eliminar.'
        });
      }
      return res.redirect('/users?notice=deleted');
    } catch (error) {
      return renderPage(res, {
        admin,
        users: await usersService.getAdminUsersList(),
        error: databaseErrorMessage(error)
      });
    }
  }
}

module.exports = new UsersController();
