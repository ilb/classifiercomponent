export default class Document {
  #_id;
  #_uuid;
  #_data;
  #_code;
  #_type;
  dossier;

  /**
   * @param {Dossier} dossier
   * @param {object} documentData
   * @param {MessageBus} messageBus
   * @param {Storage} storage
   */
  constructor(dossier, documentData, { messageBus, storage }) {
    this.messageBus = messageBus;
    this.storage = storage;

    this.#_id = documentData.id;
    this.#_uuid = documentData.uuid;
    this.#_data = documentData.data;
    this.#_code = documentData.code;
    this.#_type = documentData.type;

    this.dossier = dossier;
    this.structure = dossier.structure.getDocumentStructure(this.code);
  }

  get id() { return this.#_id; }
  get uuid() { return this.#_uuid; }
  get data() { return this.#_data; }
  get code() { return this.#_code; }
  get type() { return this.#_type; }

  async exists() {
    return !!this.#_id;
  }
}