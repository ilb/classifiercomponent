export default class GetDocument {
  /**
   * @param {DossierBuilder} dossierBuilder
   * @param {DocumentMerger} documentMerger
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
      filename : document.getDocumentName() + '.' + document.getExtension()
    }
  }
}
