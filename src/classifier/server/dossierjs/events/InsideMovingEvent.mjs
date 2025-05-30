import Event from './Event.mjs'

export default class InsideMovingEvent extends Event {
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