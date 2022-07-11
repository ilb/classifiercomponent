export default class CustomEmitter {
  handlers = [];

  /**
   * Вызов обработчиков события
   *
   * @param event
   * @returns {Promise}
   */
  async emit(event) {
    const eventName = event.constructor.name;

    if (this.handlers[eventName] && this.handlers[eventName].length) {
      return Promise.all(this.handlers[eventName].map((handler) => handler(event)));
    }
  }

  /**
   * Подписка на события
   *
   * @param event
   * @param handler
   */
  on(event, handler) {
    if (!this.handlers[event.name]) {
      this.handlers[event.name] = [];
    }
    this.handlers[event.name].push(handler)
  }
}