import { OutsideMovedEvent, OutsideMovingEvent } from '../../../dossier/index.js';

export default class DocumentService {
  /**
   * @param classifierSchema
   * @param {string} dossierPath
   * @param {MessageBus} messageBus
   * @param {DossierBuilder} dossierBuilder
   */
  constructor({ classifierSchema, dossierPath, messageBus, dossierBuilder }) {
    this.docSchema = classifierSchema.documents
    this.dossierPath = dossierPath;
    this.messageBus = messageBus;
    this.dossierBuilder = dossierBuilder;
  }
  /**
   * Перемещение страницы из одного документа в другой.
   *
   * @param {PageDocument} documentFrom
   * @param {int} pageNumberFrom
   * @param {PageDocument} documentTo
   * @param {int|null} pageNumberTo
   * @return {Promise<void>}
   */
  async movePage(documentFrom, pageNumberFrom, documentTo, pageNumberTo = null) {
    await this.messageBus.emit(new OutsideMovingEvent({ documentFrom, documentTo, pageNumberFrom }));

    const page = documentFrom.extractPage(pageNumberFrom);
    await documentTo.addPage(page, pageNumberTo);

    documentFrom.structure.save();
    documentTo.structure.save();

    await this.messageBus.emit(new OutsideMovedEvent({ documentFrom, documentTo, page }));
  }

  /**
   * Возвращает тип документа (бд) по его названию в классификаторе
   *
   * @param {string} code
   * @return {string}
   */
  getTypeByName(code) {
    return this.docSchema.find(doc => doc.code === code).type;
  }

  /**
   * Возвращает список типов документов по uuid (те типы, которые в БД, а не классификатора)
   *
   * @param {string} uuid
   * @return {string[]}
   */
  async getTypes(uuid) {
    const dossier = await this.dossierBuilder.build(uuid);
    const documents = dossier.structure.documents;
    const codes = [];

    for (const code in documents) {
      if (documents[code].pages.length) {
        codes.push(code);
      }
    }

    return this.docSchema.filter(doc => codes.includes(doc.code)).map(doc => doc.type);
  }
}