import DossierStructure from './DossierStructure.mjs';

export default class Dossier {
  constructor(uuid, documents = []) {
    this.uuid = uuid;
    this.documents = documents;
    this.structure = new DossierStructure(uuid)
  }

  /**
   * Получение документа досье по коду
   *
   * @param {string} code
   * @returns {Document|PageDocument|null}
   */
  getDocument(code) {
    return this.documents.find(document => document.code === code);
  }

  /**
   * Получение всех документов досье
   *
   * @returns {Document[]|PageDocument[]}
   */
  getDocuments() {
    return this.documents;
  }

  /**
   * Добвление в досье документов
   *
   * @param {array<Document>} documents
   */
  setDocuments(documents) {
    this.documents = documents;
  }
}