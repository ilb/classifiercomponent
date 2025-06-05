import createDebug from 'debug';

const debug = createDebug('dossierjs');

export default class DocumentStructure {
  constructor(structure, dossierStructure, type) {
    this.type = type;
    this.dossierStructure = dossierStructure;

    if (structure) {
      this.#setStructure(structure);
    } else {
      this.pages = [];
    }
  }

  save(params = {}) {
    if (params.name) {
      this.name = params.name;
    }

    debug('тип документа который приходит в сохранение:', this.type);
    const saveData = {
      lastModified: new Date().toISOString(),
      ...(this.template && { template: this.template }),
      ...(this.name && { name: this.name }),
      ...(this.versions && { versions: this.versions }),
      ...(this.currentVersion && { currentVersion: this.currentVersion })
    };

    // Если есть версии, не сохраняем страницы в основном массиве pages
    if (!this.versions || this.versions.length === 0) {
      saveData.pages = this.pages;
    }

    this.dossierStructure.save(this.type, saveData);
  }

  exists() {
    return !!this.pages.length;
  }

  refresh() {
    this.dossierStructure.refresh();
    const structure = this.dossierStructure.getDocumentStructure(this.type);
    this.#setStructure(structure);
  }

  #setStructure(structure) {
    if (structure.template) {
      this.template = structure.template;
    }

    if (structure.name) {
      this.name = structure.name;
    }

    if (structure.versions && structure.currentVersion) {
      this.currentVersion = structure.currentVersion || [];
      this.versions = structure.versions || [];
      this.pages = structure.versions.find(version => version.uuid === structure.currentVersion).pages
    } else {
      this.pages = structure.pages || [];
    }

    this.lastModified = structure.lastModified;
  }
}
