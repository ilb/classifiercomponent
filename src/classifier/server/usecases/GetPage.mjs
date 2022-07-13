import mime from 'mime-types';

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
      file: imageBuffer,
      filename: page.name,
      info: page,
      mimeType: mime.lookup(page.extension) || 'application/pdf'
    };
  }
}
