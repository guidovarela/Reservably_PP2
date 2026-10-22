const { emailPattern } = require('../middlewares/validate.middleware');

const userRoles = ['client', 'staff', 'admin'];

/**
 * Valida los datos recibidos en el cuerpo para la API de usuarios.
 */
function validateUser(body, partial = false) {
  const errors = [];
  const required = ['full_name', 'email', 'role'];
  const allowed = ['full_name', 'email', 'phone', 'role'];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  Object.keys(body).forEach((field) => {
    if (!allowed.includes(field)) errors.push(`Campo no permitido: ${field}.`);
  });

  if (!partial) {
    required.forEach((field) => {
      if (body[field] === undefined) errors.push(`Falta el campo ${field}.`);
    });
  }

  if (body.full_name !== undefined &&
      (typeof body.full_name !== 'string' || !body.full_name.trim())) {
    errors.push('full_name debe ser un texto no vacío.');
  }
  if (body.email !== undefined &&
      (typeof body.email !== 'string' || !emailPattern.test(body.email))) {
    errors.push('email debe ser una dirección válida.');
  }
  if (body.phone !== undefined && body.phone !== null && typeof body.phone !== 'string') {
    errors.push('phone debe ser texto o null.');
  }
  if (body.role !== undefined && !userRoles.includes(body.role)) {
    errors.push(`role debe ser uno de: ${userRoles.join(', ')}.`);
  }

  return errors;
}

/**
 * Sanitiza y limpia el cuerpo de una petición de usuario para la API.
 */
function cleanUserInput(body) {
  const fields = ['full_name', 'email', 'phone', 'role'];
  const input = {};
  fields.forEach((field) => {
    if (body[field] !== undefined) {
      input[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
    }
  });
  if (input.email) input.email = input.email.toLowerCase();
  return input;
}

/**
 * Valida y formatea datos recibidos desde el formulario web de administración.
 */
function getWebUserInput(body) {
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

module.exports = {
  userRoles,
  validateUser,
  cleanUserInput,
  getWebUserInput
};
