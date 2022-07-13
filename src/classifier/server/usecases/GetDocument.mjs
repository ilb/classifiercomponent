export default class GetDocument {
  /**
   * @param {DossierBuilder} dossierBuilder
   */
  constructor({ dossierBuilder }) {
    this.dossierBuilder = dossierBuilder;
  }

  async process({ uuid, name }) {
    const dossier = await this.dossierBuilder.build(uuid);
    const document = dossier.getDocument(name);

    return {
      file: await document.getDocument(),
      mimeType: document.getMimeType(),
      filename : document.getDocumentName() + '.' + document.getExtension()
    }
  }
}
