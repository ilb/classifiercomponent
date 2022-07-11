import BaseBuilder from './BaseBuilder.mjs';

export default class ClassifierSchemaBuilder extends BaseBuilder {
  build(types, context) {
    this.init(types, context);

    const classifier = this.getClassifierProperties(context.access);
    const blocks = this.getBlocksProperties();
    const tabs = this.getTabsProperties(context.access);
    const meta = this.getMeta(tabs);

    return { classifier, tabs, blocks, meta };
  }

  /**
   * Возвращает параметры вкладки классификатора
   *
   * @returns {{disabled: boolean}}
   */
  getClassifierProperties(access) {
    return {
      disabled: access === 'read' ? true : !this.processors.classifier.isDisplay()
    };
  }

  getBlocksProperties() {
    return this.types.blocks.map((block) => ({
      name: block.name || '',
      code: block.code,
      collapsed: block.collapsed || false,
      open: block?.open?.includes(this.context.stateCode) || false
    }));
  }

  getTabsProperties(access) {
    return this.types.documents
      .filter((type) => this.processors[type.code].isDisplay())
      .map((type) => ({
        name: type.name,
        code: type.code,
        type: type.type,
        accept: type.accept,
        block: type.block,
        tooltip: type.tooltip || null,
        required: this.processors[type.code].isRequired(),
        readonly: access === 'read' ? true : this.processors[type.code].isReadonly()
      }));
  }

  getMeta(tabs) {
    return {
      required: tabs.filter(tab => tab.required && !tab.readonly).map(tab => tab.code)
    };
  }
}
