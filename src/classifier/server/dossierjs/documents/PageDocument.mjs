import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import {
  Document,
  DocumentMerger,
  InsideMovedEvent,
  InsideMovingEvent,
  MessageBus,
  Page,
  RemovedEvent,
  RemovingEvent,
  UploadedEvent,
  UploadingEvent
} from '../index.js';

import createDebug from 'debug';
import { extractUuid } from '../utils.mjs';
import { v4 as uuidv4 } from 'uuid';

const debug = createDebug('dossierjs');

export default class PageDocument extends Document {
  /**
   * @param {Dossier} dossier
   * @param {object} docData
   */
  constructor(dossier, docData) {
    super(dossier, docData);
    this.documentsPath = process.env.DOSSIER_DOCUMENT_PATH;
    this.dossierPath = this.documentsPath + '/dossier';
    this.documentMerger = new DocumentMerger(this.dossierPath);
  }

  /**
   * Чтение страниц документа в файловой системе
   *
   * @returns {File[]}
   */
  getFiles() {
    const files = [];

    for (const page of this.getPages()) {
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
      return this.documentMerger.merge(this.getPages().map((page) => page.uri));
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
    if (this.structure.name) {
      return this.structure.name;
    }

    return this.type + '-' + extractUuid(this.dossier.path);
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

    const firstPageMimeType = mime.lookup(this.getPages()[0].extension);
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
    return mime.extension(this.getMimeType());
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
    return !!this.getCountPages();
  }

  /**
   * Добавление страницы в конец документа
   *
   * ! Можно передавать страницу другого документа, но не нужно, потому что собьется порядок страниц в том документе
   *
   * @param {Page} page
   * @param {int|null} numberTo
   */
  async addPage(page, numberTo = null) {
    await MessageBus.emit(new UploadingEvent({ document: this, pages: [page] }));
    await this.#processAddPage(page, numberTo);
    debug('Запуск создания структуры');
    this.structure.save();
    debug('Конец создания структуры');
    await MessageBus.emit(new UploadedEvent({ document: this, pages: [page] }));
  }

  /**
   * Нескольких страниц в конец документа
   *
   * @param {Page[]} pages
   * @param {object} params
   * @param {string|undefined} params.name
   * @param {boolean|undefined} params.isNewVersion
   * @returns {Promise<void>}
   */
  async addPages(pages, params = {}) {
    await MessageBus.emit(new UploadingEvent({ document: this, pages }));
    // Если это первая загружаемая версия документа, то принудительно указываем что это новая версия
    if (!this.structure?.versions?.length && params.hasOwnProperty("isNewVersion")) {
      params.isNewVersion = true;
    }

    if (params.isNewVersion === true) {
      this.#createNewVersion(pages, params.name);
    } else if (params.isNewVersion === false) {
      this.#addToCurrentVersion(pages, params.name);
    } else {
      pages.map(async (page) => await this.#processAddPage(page));
    }

    this.structure.save(params);

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
   * @returns {Page|null}
   */
  extractPage(number) {
    return this.getPages().splice(number - 1, 1)[0];
  }

  /**
   * Удаление всех страниц документа
   */
  async clear() {
    for (let i = this.getPages().length - 1; i >= 0; i--) {
      await this.deletePage(this.getPages()[i].uuid);
    }
  }

  /**
   * Удаление страницы
   *
   * @param {string} pageUuid
   */
  async deletePage(pageUuid) {
    await MessageBus.emit(new RemovingEvent({ document: this, pageUuid }));
    await this.#processDeletePage(pageUuid);
    this.structure.save();
    await MessageBus.emit(new RemovedEvent({ document: this, pageUuid }));
  }

  /**
   * Получение страницы документа по номеру
   *
   * @param number
   */
  getPage(number) {
    const page = this.getPages()[number - 1];

    return page || this.getDefaultPage();
  }

  /**
   * Пустая страница
   *
   * @returns {Page}
   */
  getDefaultPage() {
    return new Page({
      path: `${this.documentsPath}/default.jpg`,
      filename: 'default.jpg',
      mimetype: 'image/jpeg'
    });
  }

  /**
   * Получение страниц документа
   *
   * @returns {[]|Page[]}
   */
  getPages() {
    return this.structure.pages || [];
  }

  getVersions() {
    return this.structure.versions || [];
  }

  /**
   * Получение страницы документа по uuid
   *
   * @param {string} uuid
   */
  getPageByUuid(uuid) {
    return this.getPages().find((page) => page.uuid === uuid);
  }

  /**
   * Получение массива страниц по массиву uuid
   *
   * @param uuids
   * @return {*[]}
   */
  getPagesByUuids(uuids) {
    return this.getPages().filter((page) => uuids.includes(page.uuid));
  }

  /**
   * Получение количества страниц в документе
   *
   * @returns {int}
   */
  getCountPages() {
    return this.getPages().length;
  }

  /**
   * Добавление страницы
   *
   * @param {Page} page
   * @param numberTo - если не задано - добавит в конец документа
   * @returns {Promise<void>}
   */
  async #processAddPage(page, numberTo = null) {
    if (numberTo) {
      this.getPages().splice(numberTo - 1, 0, page);
    } else {
      this.getPages().push(page);
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

    const movingPage = this.getPages().splice(numberFrom - 1, 1)[0];

    this.getPages().splice(numberTo - 1, 0, movingPage);
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
    this.structure.pages = this.getPages().filter((page) => page.uuid !== pageUuid);
  }

  /**
   * Create new version with pages
   *
   * @param {Page[]} pages
   * @param {string|undefined} name
   */
  #createNewVersion(pages, name) {
    if (!this.structure.versions) {
      this.structure.versions = [];
    }

    const newVersionUuid = uuidv4();
    const newVersion = {
      uuid: newVersionUuid,
      name: name || '',
      pages
    };

    this.structure.versions.push(newVersion);
    this.structure.currentVersion = newVersionUuid;
  }

  /**
   * Add pages to current version
   *
   * @param {Page[]} pages
   * @param {string|undefined} name
   */
  #addToCurrentVersion(pages, name) {
    if (this.structure.versions && this.structure.currentVersion) {
      const currentVersion = this.structure.versions.find(v => v.uuid === this.structure.currentVersion);
      if (currentVersion) {
        currentVersion.pages.push(...pages);
        if (name) {
          currentVersion.name = name;
        }
      }
    }
  }
}
