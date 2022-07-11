import Event from './Event.mjs'

export default class InsideMovedEvent extends Event {
  /**
   * @param {PageDocument} document
   * @param {int} numberFrom
   * @param {int} numberTo
   */
  constructor({ document, numberFrom, numberTo }) {
    super();
    this.document = document;
    this.numberFrom = numberFrom;
    this.numberTo = numberTo;
  }
}