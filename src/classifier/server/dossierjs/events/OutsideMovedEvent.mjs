import Event from './Event.mjs'

export default class OutsideMovedEvent extends Event {
  /**
   * @param {PageDocument} documentFrom
   * @param {PageDocument} documentTo
   * @param {Page} page
   */
  constructor({ documentFrom, documentTo, page }) {
    super();
    this.documentFrom = documentFrom;
    this.documentTo = documentTo;
    this.page = page;
  }
}