import fs from 'fs';
import FormData from 'form-data';
import fetch from 'isomorphic-fetch';
import { timeoutPromise } from '../utils.mjs';

export default class ClassifierGate {
  constructor() {
    this.classifierUrl = process.env['apps.classifier.ws'];
    this.classifierTimeout = parseInt(process.env['apps.loanbroker.classifiertimeout']) || 30;
  }

  /**
   *
   * @param {Page[]} pages
   * @param {string} previousClass
   * @returns {Promise<unknown[]>}
   */
  async classify(pages, previousClass) {
    const formData = new FormData();
    const queryParams = previousClass ? new URLSearchParams({ previousClass }).toString() : '';

    pages.forEach((page) => {
      formData.append('file', fs.createReadStream(page.uri));
    });
    const res = await timeoutPromise(fetch(`${this.classifierUrl}/classify?${queryParams}`, {
        method: 'POST',
        headers: {
          ...formData.getHeaders()
        },
        body: formData
      }), new Error('Classifier Timed Out! Page: ' + JSON.stringify(pages)), this.classifierTimeout
    );

    if (res.ok) {
      const classifications = await res.json();
      return Object.values(classifications);
    } else {
      throw Error(`Error occured while classifying the page: ${await res.text()}`);
    }
  }
}
