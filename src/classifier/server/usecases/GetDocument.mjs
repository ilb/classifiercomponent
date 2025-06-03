import DocumentPathService from '../../../services/DocumentPathService.mjs';

export default class GetDocument {
  /**
   * @param {DossierBuilder} dossierBuilder
   * @param {DocumentPathRepository} documentPathRepository
   */
  constructor({ dossierBuilder, documentPathRepository }) {
    this.dossierBuilder = dossierBuilder;
    this.documentPathService = new DocumentPathService({ documentPathRepository });
  }

  async process({ uuid, type }) {
    const uuidPath = await this.documentPathService.getPath(uuid);
    const dossier = await this.dossierBuilder.build(uuidPath);
    const document = dossier.getDocument(type);

    return {
      file: await document.getDocument(),
      mimeType: document.getMimeType(),
      filename: document.getDocumentName() + '.' + document.getExtension()
    };
  }
}
