import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

/**
 * Repository for document path mappings stored in SQLite
 */
export default class DocumentPathDb {
  /**
   * Create a document path database
   * @param {string} dbPath Path to the SQLite database file
   */
  constructor(dbPath) {
    this.dbPath =
      dbPath ||
      process.env.DOCUMENT_PATH_DB ||
      path.join(process.env.DOSSIER_DOCUMENT_PATH, 'document_paths.db');
    this.dbInitialized = false;
    this.initializeDb();
  }

  /**
   * Initialize the database
   * @returns {Promise<void>}
   */
  async initializeDb() {
    // Ensure directory exists
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    // Create table if it doesn't exist
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS document_paths
      (
        uuid       TEXT PRIMARY KEY,
        path       TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.dbInitialized = true;
  }

  /**
   * Ensure database is ready for operations
   * @returns {Promise<void>}
   */
  async ensureDbReady() {
    if (!this.dbInitialized) {
      await this.initializeDb();
    }
  }

  /**
   * Store a mapping from UUID to hierarchical path
   * @param {string} uuid Document UUID
   * @param {string} path Hierarchical path (year/month/day/uuid)
   * @returns {Promise<void>}
   */
  async storeMapping(uuid, path) {
    await this.ensureDbReady();

    await this.db.run('INSERT OR REPLACE INTO document_paths (uuid, path) VALUES (?, ?)', [
      uuid,
      path
    ]);
  }

  /**
   * Get the hierarchical path for a given UUID
   * @param {string} uuid Document UUID
   * @returns {Promise<string|null>} The path or null if not found
   */
  async getPathByUuid(uuid) {
    await this.ensureDbReady();

    const result = await this.db.get('SELECT path FROM document_paths WHERE uuid = ?', [uuid]);

    return result ? result.path : null;
  }

  /**
   * Get full document path combining base path and hierarchical structure
   * @param {string} uuid Document UUID
   * @returns {Promise<string|null>} The full document path or null
   */
  async getFullDocumentPath(uuid) {
    // First check if document exists in old structure
    const oldPath = `${process.env.DOSSIER_DOCUMENT_PATH}/dossier/${uuid}`;
    if (fs.existsSync(oldPath)) {
      return oldPath;
    }

    // Try to find in new structure via database
    const hierarchicalPath = await this.getPathByUuid(uuid);
    if (hierarchicalPath) {
      return `${process.env.DOSSIER_DOCUMENT_PATH}/dossier/${hierarchicalPath}`;
    }

    // If not found anywhere, return null
    return null;
  }

  /**
   * Delete a mapping
   * @param {string} uuid Document UUID
   * @returns {Promise<boolean>} True if mapping was deleted
   */
  async deleteMapping(uuid) {
    await this.ensureDbReady();

    const result = await this.db.run('DELETE FROM document_paths WHERE uuid = ?', [uuid]);

    return result.changes > 0;
  }

  /**
   * Get all mappings
   * @returns {Promise<Array>} Array of mappings
   */
  async getAllMappings() {
    await this.ensureDbReady();

    return this.db.all('SELECT uuid, path, created_at FROM document_paths');
  }
}
