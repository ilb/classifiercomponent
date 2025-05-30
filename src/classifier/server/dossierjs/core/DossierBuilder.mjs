import Dossier from './Dossier.mjs';
import Document from '../documents/Document.mjs';
import PageDocument from '../documents/PageDocument.mjs';
import createDebug from 'debug';

const debug = createDebug('dossierjs');

export default class DossierBuilder {
  constructor({ documentRepository, dossierSchema }) {
    this.documentRepository = documentRepository;
    this.dossierSchema = dossierSchema;
  }

  /**
   * withFiles не реализован
   *
   * options.withData - загружать ли данные из бд
   * options.withFiles - загружать ли файлы
   *
   * @param path
   * @param context
   * @returns {Promise<Dossier>}
   */
  async build(path, context = { documentType: 'classifier' }) {
    debug('начинаем процесс билда Dossierjs');
    const uuid = this.extractUuid(path);
    const documentsData = await this.documentRepository.getDocumentsByUuid(uuid);
    debug('создано documentsData в билде', documentsData);
    const dossierClass = DossierBuilder.#buildDossier(context);
    debug('создано dossierClass в билде', dossierClass);
    const dossier = new dossierClass(path)
    debug('создано dossier в билде', dossier,uuid);
    const documents = this.#buildDocuments(dossier, documentsData, context);
    debug('создано documents в билде', documents);
    dossier.setDocuments(documents);
    debug('создано dossier в билде', dossier);
    return dossier;
  }

  #buildDocuments(dossier, documents, context) {
    debug('проверка правильного формирования dossierSchema',this.dossierSchema);
    return this.dossierSchema.map(document => {
      debug('проверка вложенности dossierSchema',document);
      const docData = {
        type: document.type,
      }

      const dbDoc = documents.find(doc => doc.type.code === document.type)
      debug('проверка на существование dbDoc',dbDoc);
      if (dbDoc) {
        docData.id = dbDoc.id;
        docData.uuid = dbDoc.uid;
        docData.data = dbDoc.data;
      }

      const documentClass = this.getDocumentType(context);
      debug('получение класса документа documentClass',documentClass);
      return new documentClass(dossier, docData);
    });
  }

  /**
   *
   * @param context
   */
  getDocumentType(context) {
    debug('получение контекста из метода getDocumentType', context);
    switch (context.documentType) {
      case 'classifier': return PageDocument;
      default: return Document;
    }
  }

  static #buildDossier(context) {
    // conditions
    return Dossier;
  }

  extractUuid(path) {
    const uuidRegex = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/;
    const match = path.match(uuidRegex);
    return match ? match[0] : null;
  }
}