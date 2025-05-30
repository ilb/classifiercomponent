import Event from './Event.mjs'

export default class RemovingEvent extends Event {
  /**
   * @param {PageDocument} document
   * @param {string} pageUuid
   */
  constructor({ document, pageUuid }) {
    super();
    this.document = document;
    this.pageUuid = pageUuid;
  }
}