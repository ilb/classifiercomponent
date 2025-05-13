import mime from 'mime-types';

/**
 * GetDocuments use case for retrieving document information
 */
export default class GetDocuments {
  /**
   * @param {DossierBuilder} dossierBuilder
   */
  constructor({ dossierBuilder }) {
    this.dossierBuilder = dossierBuilder;
  }

  /**
   * Process the request to get document information
   *
   * @param {string} uuid Document UUID
   * @returns {Promise<Object>} Document information
   */
  async process({ uuid }) {
    const dossier = await this.dossierBuilder.build(uuid);
    const url = `${process.env.BASE_URL}/api/classifications/${uuid}/documents`;

    return dossier.getDocuments().reduce((accumulator, document) => {
      const links = document.getPages().map((page, i) => {
        return {
          id: `${url}/${document.type}/${i + 1}?_nocache=${document.structure.lastModified}`,
          path: `${url}/${document.type}/${i + 1}?_nocache=${document.structure.lastModified}`,
          uuid: page.uuid,
          type: mime.lookup(page.extension) || page.mimeType
        };
      });

      return {
        ...accumulator,
        [document.type]: links
      };
    }, {});
  }
}