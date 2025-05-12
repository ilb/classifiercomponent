import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

/**
 * Repository for document path mappings stored in SQLite
 */
export default class DocumentPathRepository {
  /**
   * Create a document path database
   * @param {string} dbPath Path to the SQLite database file
   */
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.dbInitialized = false;
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
      CREATE TABLE IF NOT EXISTS classifiercomponent_document_paths
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

    await this.db.run(
      'INSERT OR REPLACE INTO classifiercomponent_document_paths (uuid, path) VALUES (?, ?)',
      [uuid, path]
    );
  }

  /**
   * Get the hierarchical path for a given UUID
   * @param {string} uuid Document UUID
   * @returns {Promise<string|null>} The path or null if not found
   */
  async getPathByUuid(uuid) {
    await this.ensureDbReady();

    const result = await this.db.get(
      'SELECT path FROM classifiercomponent_document_paths WHERE uuid = ?',
      [uuid]
    );

    return result ? result.path : null;
  }
}
