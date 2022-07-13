import fs from 'fs';
import path from 'path'
import Document from './Document.mjs';
import { getExtension } from 'next/dist/server/serve-static';
import ClassifierPage from "../../classifier/server/core/ClassifierPage.mjs";
import mime from 'mime-types';
import {
  InsideMovedEvent,
  InsideMovingEvent,
  RemovedEvent,
  RemovingEvent,
  UploadedEvent,
  UploadingEvent
} from '../index.js';
import MessageBus from '../core/MessageBus.mjs';
import DocumentMerger from '../../services/DocumentMerger.mjs';

export default class PageDocument extends Document {
  /**
   * @param {Dossier} dossier
   * @param {object} docData
   */
  constructor(dossier, docData) {
    super(dossier, docData);
    this.documentsPath = process.env['apps.loanbroker.documents'];
    this.dossierPath = this.dossierPath + '/dossier';
    this.documentMerger = new DocumentMerger(this.dossierPath);
  }

  /**
   * Чтение страниц документа в файловой системе
   *
   * @returns {File[]}
   */
  getFiles() {
    const files = [];

    for (const page of this.structure.pages) {
      const filePath = path.resolve('.', page.uri);
      let file = fs.createReadStream(filePath);
      files.push(file);
    }

    return files;
  }

  /**
   * Чтение определенной страницы в файловой системе
   *
   * @param number
   * @returns {Buffer}
   */
  getFile(number) {
    const page = this.getPage(number);

    return fs.readFileSync(page.uri);
  }

  /**
   * Возвращает все страницы документа одним файлом
   *
   * @returns {Promise<Buffer>}
   */
  async getDocument() {
    if (this.isImages()) {
      return this.documentMerger.merge(this.structure.pages.map(page => page.uri));
    } else {
      return fs.readFileSync(this.getPage(1).uri);
    }
  }

  /**
   * Возвращает название документа
   *
   * @returns {string}
   */
  getDocumentName() {
    return this.type + '-' + this.dossier.uuid;
  }

  /**
   * Получение mimeType документа.
   *
   * @returns {string|null}
   */
  getMimeType() {
    if (!this.getCountPages()) {
      return null;
    }

    const firstPageMimeType = mime.lookup(this.structure.pages[0].extension);
    if (firstPageMimeType.includes('image/')) {
      return 'application/pdf';
    }

    return firstPageMimeType;
  }

  /**
   * Получение расширения документа
   *
   * @returns {string}
   */
  getExtension() {
    return getExtension(this.getMimeType());
  }

  /**
   * Вернет true если документ представляет собой картинку/набор картинок и false в ином случае.
   */
  isImages() {
    return ['application/pdf', null].includes(this.getMimeType());
  }

  /**
   * Проверка наличия страниц в документе
   *
   * @returns {boolean}
   */
  exists() {
    return !!this.structure.pages.length;
  }

  /**
   * Добавление страницы в конец документа
   *
   * ! Можно передавать страницу другого документа, но не нужно, потому что собьется порядок страниц в том документе
   *
   * @param {ClassifierPage} page
   * @param {int|null} numberTo
   */
  async addPage(page, numberTo= null) {
    await MessageBus.emit(new UploadingEvent({ document: this, pages: [page] }));
    await this.#processAddPage(page, numberTo);
    this.structure.save();
    await MessageBus.emit(new UploadedEvent({ document: this, pages: [page] }));
  }

  /**
   * Нескольких страниц в конец документа
   *
   * @param {ClassifierPage[]} pages
   * @returns {Promise<void>}
   */
  async addPages(pages) {
    await MessageBus.emit(new UploadingEvent({ document: this, pages }));
    pages.map(async page => await this.#processAddPage(page))
    this.structure.save();
    await MessageBus.emit(new UploadedEvent({ document: this, pages }));
  }

  /**
   * Перемещение страницы внутри документа
   *
   * @param {int} numberFrom
   * @param {int} numberTo
   * @returns {Promise<void>}
   */
  async movePage(numberFrom, numberTo) {
    await MessageBus.emit(new InsideMovingEvent({ document: this, numberFrom, numberTo }));
    await this.#processMovePage(numberFrom, numberTo);
    this.structure.save();
    await MessageBus.emit(new InsideMovedEvent({ document: this, numberFrom, numberTo }));
  }

  /**
   * Извлечение страницы из документа
   *
   * @param {int} number
   * @returns {ClassifierPage|null}
   */
  extractPage(number) {
    return this.structure.pages.splice(number - 1, 1)[0]
  }

  /**
   * Удаление всех страниц документа
   */
  async clear() {
    for (let i = this.structure.pages.length - 1; i >= 0; i--) {
      await this.deletePage(this.structure.pages[i].uuid)
    }
  }

  /**
   * Удаление страницы
   *
   * @param {string} pageUuid
   */
  async deletePage(pageUuid) {
    await MessageBus.emit(new RemovingEvent({ document: this, pageUuid }));
    await this.#processDeletePage(pageUuid)
    this.structure.save();
    await MessageBus.emit(new RemovedEvent({ document: this, pageUuid }));
  }

  /**
   * Получение страницы документа по номеру
   *
   * @param number
   */
  getPage(number) {
    const page = this.structure.pages[number - 1];

    return page || this.getDefaultPage();
  }

  /**
   * Пустая страница
   *
   * @returns {ClassifierPage}
   */
  getDefaultPage() {
    return new ClassifierPage({
      path: `${this.documentsPath}/default.jpg`,
      filename: 'default.jpg',
      mimetype: 'image/jpeg'
    });
  }

  /**
   * Получение страницы документа по uuid
   *
   * @param {string} uuid
   */
  getPageByUuid(uuid) {
    return this.structure.pages.find(page => page.uuid === uuid);
  }

  /**
   * Получение массива страниц по массиву uuid
   *
   * @param uuids
   * @return {*[]}
   */
  getPagesByUuids(uuids) {
    return this.structure.pages.filter(page => uuids.includes(page.uuid));
  }

  /**
   * Получение количества страниц в документе
   *
   * @returns {int}
   */
  getCountPages() {
    return this.structure.pages.length;
  }

  /**
   * Добавление страницы
   *
   * @param {ClassifierPage} page
   * @param numberTo - если не задано - добавит в конец документа
   * @returns {Promise<void>}
   */
  async #processAddPage(page, numberTo = null) {
    if (numberTo) {
      this.structure.pages.splice(numberTo - 1, 0, page)
    } else {
      this.structure.pages.push(page);
    }
  }

  /**
   * Перемещение страиницы
   *
   * @param {int} numberFrom
   * @param {int} numberTo
   * @returns {Promise<void>}
   */
  async #processMovePage(numberFrom, numberTo) {
    if (numberFrom === numberTo) {
      return;
    }

    const element = this.structure.pages.splice(numberFrom - 1, 1)[0];

    this.structure.pages.splice(numberTo - 1, 0, element)
  }

  /**
   * Удаление страницы
   *
   * @param {string} pageUuid
   * @returns {Promise<void>}
   */
  async #processDeletePage(pageUuid) {
    const page = this.getPageByUuid(pageUuid);
    fs.unlinkSync(page.uri);
    this.structure.pages = this.structure.pages.filter(page => page.uuid !== pageUuid);
  }
}
