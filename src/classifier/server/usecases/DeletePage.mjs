import DocumentPathService from '../../../services/DocumentPathService.mjs';

/**
 * DeletePage use case for removing pages from documents
 */
export default class DeletePage {
  /**
   * @param {DossierBuilder} dossierBuilder
   * @param sqliteDbPath
   */
  constructor({ dossierBuilder, sqliteDbPath }) {
    this.dossierBuilder = dossierBuilder;
    this.documentPathService = new DocumentPathService(sqliteDbPath);
  }

  /**
   * Process the request to delete a page from a document
   *
   * @param {string} uuid Document UUID
   * @param {string} name Document name/type
   * @param {string} pageUuid UUID of the page to delete
   * @return {Promise<void>}
   */
  async process({ uuid, name, pageUuid }) {
    const uuidPath = await this.documentPathService.getPath(uuid);
    const dossier = await this.dossierBuilder.build(uuidPath);
    const document = dossier.getDocument(name);

    // Delete the page
    await document.deletePage(pageUuid);
  }
}
