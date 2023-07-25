import { MessageBus, OutsideMovedEvent, OutsideMovingEvent } from '@ilb/dossierjs';

export default class DocumentService {
  /**
   * @param {DossierBuilder} dossierBuilder
   */
  constructor(dossierBuilder) {
    this.dossierBuilder = dossierBuilder;
  }
  /**
   * Перемещение страницы из одного документа в другой.
   *
   * @param {PageDocument} documentFrom
   * @param {int} pageNumberFrom
   * @param {PageDocument} documentTo
   * @param {int|null} pageNumberTo
   * @return {Promise<void>}
   */
  async movePage(documentFrom, pageNumberFrom, documentTo, pageNumberTo = null) {
    await MessageBus.emit(new OutsideMovingEvent({ documentFrom, documentTo, pageNumberFrom }));

    const page = documentFrom.extractPage(pageNumberFrom);
    await documentTo.addPage(page, pageNumberTo);

    documentFrom.structure.save();
    documentTo.structure.save();

    await MessageBus.emit(new OutsideMovedEvent({ documentFrom, documentTo, page }));
  }

  /**
   * Возвращает список типов документов по uuid (те типы, которые в БД, а не классификатора)
   *
   * @param {string} uuid
   * @return {string[]}
   */
  async getTypes(uuid) {
    const types = [];
    const dossier = await this.dossierBuilder.build(uuid);

    for (const type in dossier.structure.documents) {
      if (dossier.structure.documents[type].pages.length) {
        types.push(type);
      }
    }

    return types;
  }
}
