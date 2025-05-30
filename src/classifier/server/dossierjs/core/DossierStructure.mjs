import DocumentStructure from './DocumentStructure.mjs';
import fs from 'fs';

import createDebug from 'debug';

const debug = createDebug('dossierjs');

export default class DossierStructure {
  constructor(relativePath) {
    this.structurePath = `${process.env.DOSSIER_DOCUMENT_PATH}/dossier/${relativePath}/index.json`;

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
    debug('путь до папки с index.json',this.structurePath)
    this.documents[type] = documentStructure;
    debug('запуск создания файла через fs.writeFileSync, для uuid:',this.uuid )
    fs.writeFileSync(this.structurePath, JSON.stringify({
      uuid: this.uuid,
      lastModified: (new Date()).toISOString(),
      documents: this.documents
    }, null, 2))
    debug('успешность создания файла index.json', fs.existsSync(this.structurePath))
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
