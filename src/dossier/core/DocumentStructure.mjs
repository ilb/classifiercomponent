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
    this.dossierStructure.save(this.type, {
      pages: this.pages,
      lastModified: (new Date()).toISOString(),
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
    this.pages = structure.pages;
    this.lastModified = structure.lastModified;
  }
}