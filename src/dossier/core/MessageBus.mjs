export default class MessageBus {
  /**
   * @param {CustomEmitter} eventsEmitter
   */
  constructor({ eventsEmitter }) {
    this.eventsEmitter = eventsEmitter;
  }

  /**
   * @param event
   * @returns {Promise<void>}
   */
  async emit(event) {
    return await this.eventsEmitter.emit(event);
  }

  /**
   * @param event
   * @param handler
   */
  on(event, handler) {
    this.eventsEmitter.on(event, handler);
  }
}