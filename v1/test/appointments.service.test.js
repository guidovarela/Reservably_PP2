const assert = require('node:assert/strict');
const { test } = require('node:test');
const { AppointmentsService } = require('../services/appointments.service');

const validStartsAt = '2026-11-01T10:00:00.000Z';
const mockClientId = '11111111-1111-4111-8111-111111111111';
const mockBarberId = '22222222-2222-4222-8222-222222222222';
const mockServiceId = '33333333-3333-4333-8333-333333333333';

function createMockRepos({
  client = { id: mockClientId, role: 'client' },
  barber = { id: mockBarberId, role: 'staff' },
  service = { id: mockServiceId, price: 3500, duration_minutes: 45, active: true },
  createResult = null
} = {}) {
  const usersRepo = {
    findById: async (id) => {
      if (id === mockClientId) return client;
      if (id === mockBarberId) return barber;
      return null;
    }
  };

  const servicesRepo = {
    findById: async (id) => {
      if (id === mockServiceId) return service;
      return null;
    }
  };

  const appointmentsRepo = {
    createdData: null,
    create: async (data) => {
      appointmentsRepo.createdData = data;
      return createResult || { id: 'app-1', ...data };
    }
  };

  return { usersRepo, servicesRepo, appointmentsRepo };
}

test('AppointmentsService: rechaza la reserva si el cliente no existe', async () => {
  const { usersRepo, servicesRepo, appointmentsRepo } = createMockRepos({ client: null });
  const service = new AppointmentsService(appointmentsRepo, usersRepo, servicesRepo);

  await assert.rejects(
    () => service.createAppointment({
      clientId: mockClientId,
      barberId: mockBarberId,
      serviceId: mockServiceId,
      startsAt: validStartsAt
    }),
    {
      name: 'Error',
      status: 400,
      message: 'client_id no corresponde a un cliente existente.'
    }
  );
});

test('AppointmentsService: rechaza la reserva si el usuario no tiene rol "client"', async () => {
  const { usersRepo, servicesRepo, appointmentsRepo } = createMockRepos({
    client: { id: mockClientId, role: 'admin' }
  });
  const service = new AppointmentsService(appointmentsRepo, usersRepo, servicesRepo);

  await assert.rejects(
    () => service.createAppointment({
      clientId: mockClientId,
      barberId: mockBarberId,
      serviceId: mockServiceId,
      startsAt: validStartsAt
    }),
    {
      name: 'Error',
      status: 400,
      message: 'client_id no corresponde a un cliente existente.'
    }
  );
});

test('AppointmentsService: rechaza la reserva si el barbero no existe o no tiene rol "staff"', async () => {
  const { usersRepo, servicesRepo, appointmentsRepo } = createMockRepos({
    barber: { id: mockBarberId, role: 'client' }
  });
  const service = new AppointmentsService(appointmentsRepo, usersRepo, servicesRepo);

  await assert.rejects(
    () => service.createAppointment({
      clientId: mockClientId,
      barberId: mockBarberId,
      serviceId: mockServiceId,
      startsAt: validStartsAt
    }),
    {
      name: 'Error',
      status: 400,
      message: 'barber_id no corresponde a un barbero existente.'
    }
  );
});

test('AppointmentsService: rechaza la reserva si el servicio está inactivo', async () => {
  const { usersRepo, servicesRepo, appointmentsRepo } = createMockRepos({
    service: { id: mockServiceId, price: 3500, duration_minutes: 45, active: false }
  });
  const service = new AppointmentsService(appointmentsRepo, usersRepo, servicesRepo);

  await assert.rejects(
    () => service.createAppointment({
      clientId: mockClientId,
      barberId: mockBarberId,
      serviceId: mockServiceId,
      startsAt: validStartsAt
    }),
    {
      name: 'Error',
      status: 400,
      message: 'service_id no corresponde a un servicio activo.'
    }
  );
});

test('AppointmentsService: calcula duración continua (ends_at) y congela precio al reservar con éxito', async () => {
  const { usersRepo, servicesRepo, appointmentsRepo } = createMockRepos({
    service: { id: mockServiceId, price: 4200, duration_minutes: 45, active: true }
  });
  const service = new AppointmentsService(appointmentsRepo, usersRepo, servicesRepo);

  const result = await service.createAppointment({
    clientId: mockClientId,
    barberId: mockBarberId,
    serviceId: mockServiceId,
    startsAt: '2026-11-01T10:00:00.000Z'
  });

  assert.equal(result.client_id, mockClientId);
  assert.equal(result.barber_id, mockBarberId);
  assert.equal(result.service_id, mockServiceId);
  assert.equal(result.starts_at, '2026-11-01T10:00:00.000Z');
  // 10:00 + 45 minutos = 10:45
  assert.equal(result.ends_at, '2026-11-01T10:45:00.000Z');
  assert.equal(result.price_at_booking, 4200);
  assert.equal(result.status, 'confirmed');
});
