export default class SchemaBuilder {
  constructor(matching) {
    this.processors = {};
    this.matching = matching;
  }

  /**
   * Инициализация схемы, контекста и процессоров
   * @param schema
   * @param context
   */
  init(schema, context) {
    this.schema = schema;
    this.context = context;

    // this.processors.classifier = this.getProcessor(this.schema.classifier, context);

    // console.log('this.processors.classifier', this.processors.classifier);

    this.processor = schema.processor;
    this.classifierProcessor = new schema.classifier.processor(schema.classifier, context);
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
