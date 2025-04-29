import fs from 'fs';
import path from 'path';
import { appConfig } from '../config/config.mjs';
import DocumentPathDb from '../util/DocumentPathDb.mjs';

/**
 * Repository for managing document storage and retrieval
 * Abstracts the underlying storage mechanisms
 */
export default class DocumentRepository {
  constructor() {
    this.config = appConfig.getConfig();
    this.pathDb = new DocumentPathDb(this.config.database.documentPathDb);
  }

  /**
   * Get documents by UUID - required by DossierBuilder
   * @param {string} uuid Document UUID
   * @returns {Promise<Array>} Array of document data
   */
  async getDocumentsByUuid(uuid) {
    // This method is required by DossierBuilder
    // For now, return an empty array as we handle documents through the filesystem
    return [];
  }

  /**
   * Get the document path for a UUID
   * @param {string} uuid Document UUID
   * @returns {string} Full document path
   */
  getDocumentPath(uuid) {
    return path.join(this.config.paths.dossier, 'dossier', uuid);
  }

  /**
   * Get the pages path for a document
   * @param {string} uuid Document UUID
   * @returns {string} Full pages path
   */
  getPagesPath(uuid) {
    return path.join(this.getDocumentPath(uuid), 'pages');
  }

  /**
   * Ensure a document path exists
   * @param {string} uuid Document UUID
   * @returns {string} Full document path
   */
  ensureDocumentPath(uuid) {
    const documentPath = this.getDocumentPath(uuid);

    if (!fs.existsSync(documentPath)) {
      fs.mkdirSync(documentPath, { recursive: true });
    }

    const pagesPath = path.join(documentPath, 'pages');
    if (!fs.existsSync(pagesPath)) {
      fs.mkdirSync(pagesPath, { recursive: true });
    }

    return documentPath;
  }

  /**
   * Get files in a document's pages directory
   * @param {string} uuid Document UUID
   * @returns {Array} Array of file objects
   */
  getDocumentFiles(uuid) {
    const pagesPath = this.getPagesPath(uuid);

    if (!fs.existsSync(pagesPath)) {
      return [];
    }

    const files = fs.readdirSync(pagesPath);

    return files
      .map((filename) => {
        const filePath = path.join(pagesPath, filename);
        const stats = fs.statSync(filePath);

        // Skip directories and non-files
        if (!stats.isFile()) {
          return null;
        }

        const extension = path.extname(filename).slice(1).toLowerCase();
        const fileUuid = path.basename(filename, path.extname(filename));

        return {
          filename,
          path: filePath,
          mimetype: this.getMimeTypeFromExtension(extension),
          name: filename,
          uuid: fileUuid,
          extension,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Get MIME type from file extension
   * @param {string} extension File extension
   * @returns {string} MIME type
   */
  getMimeTypeFromExtension(extension) {
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      bmp: 'image/bmp',
      tiff: 'image/tiff',
      heic: 'image/heic'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Get a file by UUID
   * @param {string} uuid Document UUID
   * @param {string} fileUuid File UUID
   * @returns {Object|null} File object or null if not found
   */
  getFile(uuid, fileUuid) {
    const files = this.getDocumentFiles(uuid);
    return files.find((file) => file.uuid === fileUuid) || null;
  }

  /**
   * Delete a file
   * @param {string} uuid Document UUID
   * @param {string} fileUuid File UUID
   * @returns {boolean} True if file was deleted
   */
  deleteFile(uuid, fileUuid) {
    const file = this.getFile(uuid, fileUuid);

    if (!file) {
      return false;
    }

    fs.unlinkSync(file.path);
    return true;
  }

  /**
   * Check if a document exists
   * @param {string} uuid Document UUID
   * @returns {boolean} True if document exists
   */
  documentExists(uuid) {
    return fs.existsSync(this.getDocumentPath(uuid));
  }

  /**
   * Read a file's content
   * @param {string} uuid Document UUID
   * @param {string} fileUuid File UUID
   * @returns {Buffer|null} File buffer or null if not found
   */
  readFile(uuid, fileUuid) {
    const file = this.getFile(uuid, fileUuid);

    if (!file) {
      return null;
    }

    return fs.readFileSync(file.path);
  }
}
