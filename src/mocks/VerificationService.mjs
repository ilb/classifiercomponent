export default class VerificationService {
  /**
   *
   */
  constructor() {}

  /**
   * Добавление таска
   *
   * @param type
   * @param path
   * @returns {Promise<*>}
   */
  async add(type, path) {}

  /**
   * Старт таска
   *
   * @param verification
   * @returns {Promise<*>}
   */
  async start(verification) {}

  /**
   * Завершение таска
   *
   * @param verification
   * @param data
   * @returns {Promise<*>}
   */
  async finish(verification, data = []) {}

  /**
   * Отмена таска
   *
   * @param verification
   * @param data
   * @returns {Promise<*>}
   */
  async cancel(verification, data = []) {}
}
