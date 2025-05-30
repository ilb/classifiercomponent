export default class Document {
  #_id;
  #_uuid;
  #_data;
  #_type;
  dossier;

  /**
   * @param {Dossier} dossier
   * @param {object} documentData
   */
  constructor(dossier, documentData) {
    this.#_id = documentData.id;
    this.#_uuid = documentData.uuid;
    this.#_data = documentData.data;
    this.#_type = documentData.type;

    this.dossier = dossier;
    this.structure = dossier.structure.getDocumentStructure(this.type);
  }

  get id() { return this.#_id; }
  get uuid() { return this.#_uuid; }
  get data() { return this.#_data; }
  get type() { return this.#_type; }

  async exists() {
    return !!this.#_id;
  }
}