/**
 * DeletePage use case for removing pages from documents
 */
export default class DeletePage {
  /**
   * @param {DossierBuilder} dossierBuilder
   */
  constructor({ dossierBuilder }) {
    this.dossierBuilder = dossierBuilder;
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
    // Get document from dossier
    const dossier = await this.dossierBuilder.build(uuid);
    const document = dossier.getDocument(name);

    // Delete the page
    await document.deletePage(pageUuid);
  }
}
