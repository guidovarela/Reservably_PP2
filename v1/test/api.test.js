const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const http = require('node:http');
const path = require('node:path');
const ejs = require('ejs');

process.env.API_TOKEN = 'test-api-token';
const app = require('../app');

let server;
let baseUrl;

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

async function request(path, { token = 'test-api-token', ...options } = {}) {
  const headers = { 'content-type': 'application/json', ...(options.headers || {}) };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  return { response, body: await response.json() };
}

test('rechaza solicitudes sin token de API', async () => {
  const { response, body } = await request('/api/users', { token: null });
  assert.equal(response.status, 401);
  assert.match(body.error, /Bearer/);
});

test('rechaza tokens inválidos', async () => {
  const { response, body } = await request('/api/users', { token: 'incorrecto' });
  assert.equal(response.status, 401);
  assert.equal(body.error, 'Token de acceso inválido.');
});

test('valida los datos antes de acceder a Supabase', async () => {
  const { response, body } = await request('/api/users', {
    method: 'POST',
    body: JSON.stringify({ full_name: 'Nombre incompleto' })
  });
  assert.equal(response.status, 400);
  assert.deepEqual(body.details, ['Falta el campo email.', 'Falta el campo role.']);
});

test('valida duraciones y evita campos no permitidos en servicios', async () => {
  const { response, body } = await request('/api/services', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Corte',
      price: 5000,
      duration_minutes: 0,
      id: 'no-permitido'
    })
  });
  assert.equal(response.status, 400);
  assert.ok(body.details.includes('duration_minutes debe ser un entero positivo.'));
  assert.ok(body.details.includes('Campo no permitido: id.'));
});

test('valida UUIDs, roles de turno y fecha con zona horaria', async () => {
  const { response, body } = await request('/api/appointments', {
    method: 'POST',
    body: JSON.stringify({
      client_id: 'cliente',
      barber_id: 'barbero',
      service_id: 'servicio',
      starts_at: 'mañana'
    })
  });
  assert.equal(response.status, 400);
  assert.equal(body.details.length, 4);
});

test('responde JSON al recibir un cuerpo mal formado en la API', async () => {
  const { response, body } = await request('/api/users', {
    method: 'POST',
    body: '{'
  });
  assert.equal(response.status, 400);
  assert.equal(typeof body.error, 'string');
});

test('renderiza la página con grillas Tailwind', async () => {
  const html = await ejs.renderFile(path.join(__dirname, '..', 'views', 'index.ejs'), {
    title: 'Barbería PP2',
    connectionOk: true,
    connectionMessage: 'Conexión correcta.',
    services: [{
      id: 'service-id',
      name: 'Corte clásico',
      description: 'Corte de cabello',
      price: 5000,
      duration_minutes: 30
    }],
    staff: [{ id: 'staff-id', full_name: 'Barbero de prueba' }],
    queryError: null
  });
  assert.match(html, /grid-cols-1/);
  assert.match(html, /Nuestro equipo/);
  assert.match(html, /href="\/users"/);
});

test('muestra el inicio de sesión al visitar la gestión de usuarios', async () => {
  const response = await fetch(`${baseUrl}/users`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Gestión de usuarios/);
  assert.match(html, /Iniciar sesión como administrador/);
});

test('protege el alta web cuando no hay una sesión administrativa', async () => {
  const response = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      full_name: 'Usuario de prueba',
      email: 'prueba@example.com',
      role: 'admin'
    }),
    redirect: 'manual'
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/users');
});
