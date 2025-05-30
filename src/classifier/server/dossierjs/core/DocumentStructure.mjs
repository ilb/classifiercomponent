import createDebug from 'debug';

const debug = createDebug('dossierjs');

export default class DocumentStructure {
  constructor(structure, dossierStructure, type) {
    this.type = type;
    this.dossierStructure = dossierStructure

    if (structure) {
      this.#setStructure(structure);
    } else {
      this.pages = [];
    }
  }

  save() {
    debug('тип документа который приходит в сохранение:', this.type);
    this.dossierStructure.save(this.type, {
      pages: this.pages,
      lastModified: (new Date()).toISOString(),
      ...(this.template && { template: this.template }),
    });
  }

  exists() {
    return !!this.pages.length;
  }

  refresh() {
    this.dossierStructure.refresh();
    const structure = this.dossierStructure.getDocumentStructure(this.type)
    this.#setStructure(structure);
  }

  #setStructure(structure) {
    if (structure.template) {
      this.template = structure.template;
    }

    this.pages = structure.pages || [];
    this.lastModified = structure.lastModified;
  }
}