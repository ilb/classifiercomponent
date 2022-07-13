/**
 * Для создания обработчика события нужно отнаследоваться от этого класса
 * и определить методы events(), filter() и process().
 */
import MessageBus from './MessageBus.mjs';

export default class Handler {
  constructor(scope) {
    for (const event of this.events()) {
      MessageBus.on(event, this.execute(scope))
    }
  }

  /**
   * Массив с классами событий, на которые будет подвешен обработчик
   *
   * @returns {Event[]}
   */
  events() {
    return [];
  }

  /**
   * Инициализация полей класса
   *
   * @param data
   * @param scope
   * @returns {Promise<void>}
   */
  async init(data, scope) {}


  /**
   * Фильтрация события. Если будет возвращено false - функция process() не будет вызвана
   *
   * @returns {Promise<boolean>}
   */
  async filter() {
    return true;
  }

  /**
   * Обработка события
   *
   * @returns {Promise<boolean>}
   */
  async process() {}

  /**
   * @param scope
   * @returns {(function(*): Promise<void>)|*}
   */
  execute(scope) {
    return async (data) => {
      this.eventName = data.constructor.name;
      await this.init(data, scope);
      await this.filter() && await this.process()
    };
  }
}