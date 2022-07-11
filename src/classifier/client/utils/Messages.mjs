export default class ErrorMessages {
  static defaultError = 'Упс... Что-то пошло не так.';

  static getWordByCount(root, count) {
    switch (count) {
      case 0:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
        return root + 'ей';
      case 1:
        return root + 'ь';
      case 2:
      case 3:
      case 4:
        return root + 'и';
    }
  };

  /**
   * @param {{number:int, count:int}[]} pages
   * @returns {string[]}
   */
  static signatureVerification(pages) {
    return pages.map(page => {
      return `На странице ${page.number} пропущен${page.count > 1 ? 'о' : 'а'} ${page.count} ${ErrorMessages.getWordByCount('подпис', page.count)}.`;
    })
  }
}
