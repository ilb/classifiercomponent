export default class GetDocument {
  /**
   * @param {DossierBuilder} dossierBuilder
   * @param {IMagicDocumentMerger} documentMerger
   */
  constructor({ dossierBuilder, documentMerger }) {
    this.dossierBuilder = dossierBuilder;
    this.documentMerger = documentMerger;
  }

  async process({ uuid, name }) {
    const dossier = await this.dossierBuilder.build(uuid);
    const document = dossier.getDocument(name);

    return {
      file: await document.getDocument(),
      mimeType: document.getMimeType(),
      extension: document.getExtension(),
      filename : document.getDocumentName()
    }
  }
}
