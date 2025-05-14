/**
 * Repository for document path mappings stored in SQLite
 */
export default class DocumentPathRepository {
  /**
   * Store a mapping from UUID to hierarchical path
   * @param {string} uuid Document UUID
   * @param {string} path Hierarchical path (year/month/day/uuid)
   * @returns {Promise<void>}
   */
  async storePath(uuid, path) {
    // нужно сохранить путь где-нибудь
  }

  /**
   * Get the hierarchical path for a given UUID
   * @param {string} uuid Document UUID
   * @returns {Promise<string|null>} The path or null if not found
   */
  async getPathByUuid(uuid) {
    return uuid;
    // должен вернуть путь к папке с файлами
  }
}
