export default class SchemaBuilder {
  constructor(matching) {
    this.processors = {};
    this.matching = matching
  }

  /**
   * Инициализация схемы, контекста и процессоров
   * @param schema
   * @param context
   */
  init(schema, context) {
    this.schema = schema;
    this.context = context;
    this.processors.classifier = this.getProcessor(this.schema.classifier, context);

    for (const documentSchema of this.schema.documents) {
      this.processors[documentSchema.type] = this.getProcessor(documentSchema, context);
    }
  }

  /**
   * Возвращает процессор для переданного документа
   *
   * @param documentSchema
   * @param context
   * @returns {*|TabProcessor}
   */
  getProcessor(documentSchema, context) {
    return new this.matching[documentSchema.processor](documentSchema, context);
  }

  /**
   * Формирование схемы полей классификатора
   * в соответсвии со статусом и описанием документов в index.js
   *
   * context.stateCode - является обязательным полем
   *
   * @param types
   * @param context
   * @returns any
   */
  // eslint-disable-next-line no-unused-vars
  build(types, context) {}
}
