export default class DocumentStructure {
  constructor(structure, dossierStructure, code) {
    this.code = code;
    this.dossierStructure = dossierStructure

    if (structure) {
      this.#setStructure(structure);
    } else {
      this.pages = [];
    }
  }

  save() {
    this.dossierStructure.save(this.code, {
      pages: this.pages,
      lastModified: (new Date()).toISOString(),
    });
  }

  exists() {
    return !!this.pages.length;
  }

  refresh() {
    this.dossierStructure.refresh();
    const structure = this.dossierStructure.getDocumentStructure(this.code)
    this.#setStructure(structure);
  }

  #setStructure(structure) {
    this.pages = structure.pages;
    this.lastModified = structure.lastModified;
  }
}