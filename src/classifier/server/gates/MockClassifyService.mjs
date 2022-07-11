import Timeout from 'await-timeout';

export default class MockClassifyService {
  /**
   * Мок классификатора
   *
   * @param page
   * @returns {Promise<string>}
   */
  async classify(page) {
    await Timeout.set(2000);

    if (page.uri.includes('passport')) {
      return 'PASSPORT';
    }

    if (page.uri.includes('agreement')) {
      return 'AGREEMENT';
    }

    return 'UNKNOWN';
  }
}
