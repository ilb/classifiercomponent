import DossierStructure from './DossierStructure.mjs';

export default class Dossier {
  constructor(path, documents = []) {
    this.path = path;
    this.documents = documents;
    this.structure = new DossierStructure(path)
  }

  /**
   * Получение документа досье по коду
   *
   * @param {string} type
   * @returns {Document|PageDocument|null}
   */
  getDocument(type) {
    return this.documents.find(document => document.type === type);
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