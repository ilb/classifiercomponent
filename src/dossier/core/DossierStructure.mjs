import DocumentStructure from './DocumentStructure.mjs';
import fs from 'fs';

export default class DossierStructure {
  constructor(uuid) {
    this.structurePath = `${process.env['apps.loanbroker.documents']}/dossier/${uuid}/index.json`;

    if (fs.existsSync(this.structurePath)) {
      this.#loadStructure();
    } else {
      this.documents = {};
    }
  }

  refresh() {
    this.#loadStructure();
  }

  save(type, documentStructure) {
    this.documents[type] = documentStructure;

    fs.writeFileSync(this.structurePath, JSON.stringify({
      uuid: this.uuid,
      lastModified: (new Date()).toISOString(),
      documents: this.documents
    }, null, 2))
  }

  getDocumentStructure(type) {
    return new DocumentStructure(this.documents[type], this, type)
  }

  exists() {
    return !!this.documents.length();
  }

  #loadStructure() {
    const structure = JSON.parse(fs.readFileSync(this.structurePath));
    this.uuid = structure.uuid;
    this.documents = structure.documents;
  }
}
