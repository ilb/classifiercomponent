import fs from 'fs';
import FormData from 'form-data';
import fetch from 'isomorphic-fetch';
export default class DossierCoreGate {
  constructor() {
    this.dossierCoreUrl = process.env['apps.dossierCore.ws'] || '';
  }

  /**
   *
   * @param {Page[]} pages
   * @param {string} previousClass
   */
  async getDocument(pages, previousClass) {
    const res = fetch(`${dossierCoreUrl}/`);
  }

  /**
   * @param {string} project
   * @returns {Json}
   */
  async getSchema(project) {
    const res = fetch(`${dossierCoreUrl}/dossiercore/api/schema/${project}`, {
      method: 'GET',
    });

    if (res.ok) {
      const schema = await res.json();
      return schema;
    } else {
      throw Error(`Не удалось полуичть схему`);
    }
  }
}
