import { getMimeType } from '../../../../src/utils.mjs';

export default class GetPage {
  constructor({ dossierBuilder }) {
    this.dossierBuilder = dossierBuilder;
  }

  async process({ uuid, name, number }) {
    const dossier = await this.dossierBuilder.build(uuid);
    const document = dossier.getDocument(name);
    const page = document.getPage(number);
    const imageBuffer = document.getFile(number);

    return {
      info: page,
      document: imageBuffer,
      contentType: getMimeType(page.extension) || 'application/pdf'
    };
  }
}
