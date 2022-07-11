import Event from './Event.mjs'

export default class OutsideMovingEvent extends Event {
  /**
   * @param {PageDocument} documentFrom
   * @param {PageDocument} documentTo
   * @param {int} pageNumberFrom
   */
  constructor({ documentFrom, documentTo, pageNumberFrom }) {
    super();
    this.documentFrom = documentFrom;
    this.documentTo = documentTo;
    this.pageNumberFrom = pageNumberFrom;
  }
}