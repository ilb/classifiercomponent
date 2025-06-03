import DocumentPathService from '../../../services/DocumentPathService.mjs';

/**
 * DeletePage use case for removing pages from documents
 */
export default class DeletePage {
  /**
   * @param {DossierBuilder} dossierBuilder
   * @param {DocumentPathRepository} documentPathRepository
   */
  constructor({ dossierBuilder, documentPathRepository }) {
    this.dossierBuilder = dossierBuilder;
    this.documentPathService = new DocumentPathService({ documentPathRepository });
  }

  /**
   * Process the request to delete a page from a document
   *
   * @param {string} uuid Document UUID
   * @param {string} type Document type
   * @param {string} pageUuid UUID of the page to delete
   * @return {Promise<void>}
   */
  async process({ uuid, type, pageUuid }) {
    const uuidPath = await this.documentPathService.getPath(uuid);
    const dossier = await this.dossierBuilder.build(uuidPath);
    const document = dossier.getDocument(type);

    // Delete the page
    await document.deletePage(pageUuid);
  }
}
