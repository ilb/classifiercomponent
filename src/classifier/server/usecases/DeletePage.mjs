export default class DeletePage {
  /**
   * @param {DossierBuilder} dossierBuilder
   */
  constructor({ dossierBuilder }) {
    this.dossierBuilder = dossierBuilder;
  }

  /**
   *
   * @param uuid
   * @param name
   * @param pageUuid
   * @return {Promise<void>}
   */
  async process({ uuid, name, pageUuid }) {
    const dossier = await this.dossierBuilder.build(uuid);
    const document = dossier.getDocument(name);
    await document.deletePage(pageUuid);
  }
}
