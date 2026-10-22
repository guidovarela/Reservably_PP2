const appointmentsRepository = require('../repositories/appointments.repository');
const usersRepository = require('../repositories/users.repository');
const servicesRepository = require('../repositories/services.repository');

/**
 * Servicio con la lógica de negocio para la gestión de turnos.
 * Responde la decisión clave del software:
 * "¿Está el cliente habilitado y cuenta el barbero con la disponibilidad requerida?"
 */
class AppointmentsService {
  constructor(
    appointmentsRepo = appointmentsRepository,
    usersRepo = usersRepository,
    servicesRepo = servicesRepository
  ) {
    this.appointmentsRepository = appointmentsRepo;
    this.usersRepository = usersRepo;
    this.servicesRepository = servicesRepo;
  }

  async getAllAppointments() {
    return this.appointmentsRepository.findAllWithDetails();
  }

  async getAppointmentById(id) {
    return this.appointmentsRepository.findById(id);
  }

  /**
   * Procesa la reserva de un turno validando habilitación, roles y duración continua.
   */
  async createAppointment({ clientId, barberId, serviceId, startsAt }) {
    // 1. Verificación paralela de existencia de actores y oferta comercial
    const [client, barber, service] = await Promise.all([
      this.usersRepository.findById(clientId),
      this.usersRepository.findById(barberId),
      this.servicesRepository.findById(serviceId)
    ]);

    // 2. Regla de negocio: Habilitación y rol del cliente
    if (!client || client.role !== 'client') {
      const error = new Error('client_id no corresponde a un cliente existente.');
      error.status = 400;
      throw error;
    }

    // 3. Regla de negocio: Disponibilidad y rol del barbero
    if (!barber || barber.role !== 'staff') {
      const error = new Error('barber_id no corresponde a un barbero existente.');
      error.status = 400;
      throw error;
    }

    // 4. Regla de negocio: Servicio activo
    if (!service || !service.active) {
      const error = new Error('service_id no corresponde a un servicio activo.');
      error.status = 400;
      throw error;
    }

    // 5. Cálculo del bloque de tiempo continuo
    const startDate = new Date(startsAt);
    const endDate = new Date(startDate.getTime() + service.duration_minutes * 60 * 1000);

    // 6. Inserción con persistencia de precio histórico
    return this.appointmentsRepository.create({
      client_id: clientId,
      barber_id: barberId,
      service_id: serviceId,
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      price_at_booking: service.price,
      status: 'confirmed'
    });
  }
}

const defaultInstance = new AppointmentsService();
defaultInstance.AppointmentsService = AppointmentsService;

module.exports = defaultInstance;
