import mime from 'mime-types';
import DocumentPathService from '../../../services/DocumentPathService.mjs';

export default class GetPage {
  /**
   * @param {DossierBuilder} dossierBuilder
   * @param {string} sqliteDbPath
   */
  constructor({ dossierBuilder, sqliteDbPath }) {
    this.dossierBuilder = dossierBuilder;
    this.documentPathService = new DocumentPathService(sqliteDbPath);
  }

  async process({ uuid, name, number }) {
    const uuidPath = await this.documentPathService.getPath(uuid);
    const dossier = await this.dossierBuilder.build(uuidPath);
    const document = dossier.getDocument(name);
    const page = document.getPage(number);
    const imageBuffer = document.getFile(number);

    return {
      file: imageBuffer,
      filename: page.name,
      info: page,
      mimeType: mime.lookup(page.extension) || 'application/pdf'
    };
  }
}
