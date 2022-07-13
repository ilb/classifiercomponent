export default class BaseBuilder {
  constructor({ matching }) {
    this.processors = {};
    this.matching = matching
  }

  init(schema, context) {
    this.context = context;
    this.initializeSchema(schema);
    this.initializeProcessors(context);
  }

  /**
   * Инициализация схемы документов
   *
   * @param schema
   */
  initializeSchema(schema) {
    this.schema = schema;
  }

  /**
   * Инициализация процессоров для каждого документа
   *
   * @param context
   */
  initializeProcessors(context) {
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
   * @returns {*|DefaultProcessor}
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
