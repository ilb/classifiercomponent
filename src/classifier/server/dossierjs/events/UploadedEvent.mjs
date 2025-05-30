import Event from './Event.mjs'
import createDebug from 'debug';

const debug = createDebug('dossierjs');

export default class UploadedEvent extends Event {
  /**
   * @param {PageDocument} document
   * @param {Page[]} pages
   */
  constructor({ document, pages }) {
    super();
    this.document = document
    this.pages = pages
  }

  emit() {
    debug('Документы пришедшие при загрузке файлов в классифаер',this.document,'Страницы пришедшие при загрузке файлов в классифаер',this.pages);
  }
}