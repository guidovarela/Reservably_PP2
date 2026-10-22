const usersRepository = require('../repositories/users.repository');
const { cleanUserInput } = require('../validators/user.validator');

/**
 * Servicio con la lógica de negocio y operaciones de usuarios.
 */
class UsersService {
  constructor(usersRepo = usersRepository) {
    this.usersRepository = usersRepo;
  }

  async getAllUsers() {
    return this.usersRepository.findAll();
  }

  async getAdminUsersList() {
    return this.usersRepository.findForAdminList();
  }

  async getStaffUsers() {
    return this.usersRepository.findStaffMembers();
  }

  async getUserById(id) {
    return this.usersRepository.findById(id);
  }

  async getUserByEmail(email) {
    return this.usersRepository.findByEmail(email);
  }

  async createUser(body) {
    const input = cleanUserInput(body);
    return this.usersRepository.create(input);
  }

  async updateUser(id, body) {
    const input = cleanUserInput(body);
    return this.usersRepository.update(id, input);
  }

  async deleteUser(id) {
    return this.usersRepository.delete(id);
  }
}

const defaultInstance = new UsersService();
defaultInstance.UsersService = UsersService;

module.exports = defaultInstance;
