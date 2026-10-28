const servicesRepository = require('../repositories/services.repository');
const { cleanServiceInput } = require('../validators/service.validator');

/**
 * Servicio con la lógica de negocio y operaciones de servicios de barbería.
 */
class ServicesService {
  constructor(servicesRepo = servicesRepository) {
    this.servicesRepository = servicesRepo;
  }

  async getAllServices() {
    return this.servicesRepository.findAll();
  }

  async getActiveServices() {
    return this.servicesRepository.findActive();
  }

  async getServiceById(id) {
    return this.servicesRepository.findById(id);
  }

  async createService(body) {
    const input = cleanServiceInput(body);
    return this.servicesRepository.create(input);
  }

  async updateService(id, body) {
    const input = cleanServiceInput(body);
    return this.servicesRepository.update(id, input);
  }

  async deleteService(id) {
    return this.servicesRepository.delete(id);
  }
}

const defaultInstance = new ServicesService();
defaultInstance.ServicesService = ServicesService;

module.exports = defaultInstance;
