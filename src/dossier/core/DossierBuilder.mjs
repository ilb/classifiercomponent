import Dossier from './Dossier.mjs';
import Document from './Document.mjs';
import PageDocument from '../documents/PageDocument.mjs';

export default class DossierBuilder {
  /**
   * @param scope
   */
  constructor(scope) {
    this.documentRepository = scope.documentRepository;
    this.dossierSchema = scope.dossierSchema;
    this.scope = scope;
  }

  /**
   * withFiles не реализован
   *
   * options.withData - загружать ли данные из бд
   * options.withFiles - загружать ли файлы
   *
   * @param uuid
   * @param context
   * @returns {Promise<Dossier>}
   */
  async build(uuid, context = { documentType: 'classifier' }) {
    const documentsData = await this.documentRepository.getDocumentsByDossier(uuid);
    const dossierClass = DossierBuilder.#buildDossier(context);
    const dossier = new dossierClass(uuid)
    const documents = this.#buildDocuments(dossier, documentsData, context);

    dossier.setDocuments(documents);

    return dossier;
  }

  #buildDocuments(dossier, documents, context) {
    return this.dossierSchema.map(document => {
      const docData = {
        code: document.code,
        type: document.type,
      }

      const dbDoc = documents.find(doc => doc.type.code === document.type)

      if (dbDoc) {
        docData.id = dbDoc.id;
        docData.uuid = dbDoc.uid;
        docData.data = dbDoc.data;
      }

      const documentClass = this.getDocumentType(context);

      return new documentClass(dossier, docData, this.scope);
    });
  }

  /**
   *
   * @param context
   */
  getDocumentType(context) {
    switch (context.documentType) {
      case 'classifier': return PageDocument;
      default: return Document;
    }
  }

  static #buildDossier(context) {
    // conditions
    return Dossier;
  }
}