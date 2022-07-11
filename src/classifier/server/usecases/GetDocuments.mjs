import { fromEnv, getMimeType } from '../../../../src/utils.mjs';

export default class GetDocuments {
  /**
   * @param {DossierBuilder} dossierBuilder
   */
  constructor({ dossierBuilder }) {
    this.dossierBuilder = dossierBuilder;
  }

  async process({ uuid }) {
    const dossier = await this.dossierBuilder.build(uuid);
    const url = `${fromEnv('BASE_URL')}/api/classifications/${uuid}/documents`;

    return dossier.getDocuments().reduce((accumulator, document) => {
      const links = document.structure.pages.map((page, i) => {
        return {
          id: `${url}/${document.code}/${i + 1}?_nocache=${document.structure.lastModified}`,
          path: `${url}/${document.code}/${i + 1}?_nocache=${document.structure.lastModified}`,
          uuid: page.uuid,
          type: getMimeType(page.extension)
        };
      });

      return {
        ...accumulator,
        [document.code]: links
      };
    }, {});
  }
}
