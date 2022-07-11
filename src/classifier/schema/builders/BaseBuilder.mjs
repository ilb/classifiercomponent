export default class BaseBuilder {
  constructor({ matching }) {
    this.processors = {};
    this.matching = matching
  }

  init(types, context) {
    this.context = context;
    this.initializeTypes(types);
    this.initializeProcessors(context);
  }

  /**
   * Инициализация типов документов
   *
   * @param types
   */
  initializeTypes(types) {
    this.types = types;
  }

  /**
   * Инициализация процессоров для каждого документа
   *
   * @param context
   */
  initializeProcessors(context) {
    this.processors.classifier = this.getProcessor(this.types.classifier, context);

    for (const type of this.types.documents) {
      this.processors[type.code] = this.getProcessor(type, context);
    }
  }

  /**
   * Возвращает процессор для переданного документа
   *
   * @param type
   * @param context
   * @returns {*|DefaultProcessor}
   */
  getProcessor(type, context) {
    return new this.matching[type.processor](type, context);
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
