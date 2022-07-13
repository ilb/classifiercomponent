import EventsEmitter from './CustomEmitter.mjs';

export default class MessageBus {
  /**
   * @param event
   * @returns {Promise<void>}
   */
  static async emit(event) {
    return await EventsEmitter.emit(event);
  }

  /**
   * @param event
   * @param handler
   */
  static on(event, handler) {
    EventsEmitter.on(event, handler);
  }
}