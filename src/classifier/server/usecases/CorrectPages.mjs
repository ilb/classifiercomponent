import DocumentService from '../core/DocumentService.mjs';

export default class CorrectPages {
  /**
   *
   * @param {DossierBuilder} dossierBuilder
   */
  constructor({ dossierBuilder }) {
    this.documentService = new DocumentService(dossierBuilder);
    this.dossierBuilder = dossierBuilder;
  }

  /**
   * @param uuid
   * @param corrections
   * @return {Promise<*>}
   */
  async process({ uuid, ...corrections }) {
    const dossier = await this.dossierBuilder.build(uuid);

    await Promise.all(
      Object.values(corrections).map(async (correction) => {
        const { from, to } = correction;

        if ((from.class === to.class && from.page === to.page) || !to.page) {
          return;
        }

        if (from.class === to.class) {
          const document = dossier.getDocument(from.class);

          await document.movePage(from.page, to.page);
        } else {
          const fromDocument = await dossier.getDocument(from.class);
          const toDocument = await dossier.getDocument(to.class);

          await this.documentService.movePage(fromDocument, from.page, toDocument, to.page);
        }
      })
    );
  }
}
