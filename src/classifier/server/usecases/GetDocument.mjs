import DocumentPathService from '../../../services/DocumentPathService.mjs';

export default class GetDocument {
  /**
   * @param {DossierBuilder} dossierBuilder
   * @param {string} sqliteDbPath
   */
  constructor({ dossierBuilder, sqliteDbPath }) {
    this.dossierBuilder = dossierBuilder;
    this.documentPathService = new DocumentPathService(sqliteDbPath);
  }

  async process({ uuid, name }) {
    const uuidPath = await this.documentPathService.getPath(uuid);
    const dossier = await this.dossierBuilder.build(uuidPath);
    const document = dossier.getDocument(name);

    return {
      file: await document.getDocument(),
      mimeType: document.getMimeType(),
      filename: document.getDocumentName() + '.' + document.getExtension()
    };
  }
}
