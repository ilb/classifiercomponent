import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Poppler } from 'node-poppler';
import { appConfig } from '../config/config.mjs';

/**
 * Centralized service for file operations
 * Handles file saving, conversion, and cleanup
 */
export default class FileService {
  constructor() {
    this.config = appConfig.getConfig();
    this.poppler = new Poppler(this.config.paths.poppler);
  }

  /**
   * Ensure a directory exists
   * @param {string} dirPath Directory path to ensure
   * @returns {string} The directory path
   */
  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    return dirPath;
  }

  /**
   * Get the document path for a given UUID
   * @param {string} uuid Document UUID
   * @returns {string} Full document path
   */
  getDocumentPath(uuid) {
    const basePath = this.config.paths.dossier;

    return path.join(basePath, 'dossier', uuid);
  }

  /**
   * Get the pages path for a document
   * @param {string} uuid Document UUID
   * @returns {string} Full pages path
   */
  getPagesPath(uuid) {
    const documentPath = this.getDocumentPath(uuid);

    return path.join(documentPath, 'pages');
  }

  /**
   * Save a memory buffer to disk with a unique filename
   * @param {Buffer} buffer File buffer
   * @param {string} originalName Original filename
   * @param {string} savePath Directory to save to
   * @returns {Object} File metadata
   */
  saveBufferToFile(buffer, originalName, savePath) {
    const fileUuid = uuidv4();
    const extension = path.extname(originalName).slice(1).toLowerCase();

    // Handle a special case for jfif files
    const normalizedExtension = extension === 'jfif' ? 'jpg' : extension;
    const filename = `${fileUuid}.${normalizedExtension}`;
    const filePath = path.join(savePath, filename);

    // Ensure directory exists
    this.ensureDirectoryExists(savePath);

    // Write the file to disk
    fs.writeFileSync(filePath, buffer);

    return {
      originalname: originalName,
      filename: filename,
      path: filePath,
      mimetype: this.getMimeType(normalizedExtension),
      name: filename,
      uuid: fileUuid,
      extension: normalizedExtension
    };
  }

  /**
   * Get a mime type from file extension
   * @param {string} extension File extension
   * @returns {string} Mime type
   */
  getMimeType(extension) {
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
   * Process a PDF file and extract pages as images
   * @param {Object} file PDF file object with buffer
   * @param {string} savePath Directory to save extracted pages
   * @returns {Promise<Array>} Array of file metadata objects
   */
  async processPdfFile(file, savePath) {
    const fileUuid = uuidv4();
    const tmpFilePath = path.join(savePath, `${fileUuid}.pdf`);
    const splitOutputPath = path.join(savePath, fileUuid);

    // Ensure directories exist
    this.ensureDirectoryExists(savePath);
    this.ensureDirectoryExists(splitOutputPath);

    // Save PDF to disk temporarily
    fs.writeFileSync(tmpFilePath, file.buffer);

    try {
      // Use poppler to convert PDF to images
      await this.poppler.pdfToCairo(
        tmpFilePath,
        path.join(splitOutputPath, file.originalname.split('.')[0]),
        {
          jpegFile: true
        }
      );

      // Read the generated image files
      const pages = fs.readdirSync(splitOutputPath);

      // Process each page
      return pages.map((page) => {
        const pageUuid = uuidv4();
        const filename = `${pageUuid}.jpg`;
        const pagePath = path.join(savePath, filename);

        // Rename the file to use the UUID
        fs.renameSync(path.join(splitOutputPath, page), pagePath);

        return {
          originalname: page,
          filename: filename,
          path: pagePath,
          mimetype: 'image/jpeg',
          name: filename,
          uuid: pageUuid,
          extension: 'jpg'
        };
      });
    } finally {
      // Clean up temporary files
      if (fs.existsSync(tmpFilePath)) {
        fs.unlinkSync(tmpFilePath);
      }
      if (fs.existsSync(splitOutputPath)) {
        fs.rmdirSync(splitOutputPath, { recursive: true });
      }
    }
  }

  /**
   * Process a file (either PDF or regular file)
   * @param {Object} file File object with buffer
   * @param {string} uuid Document UUID
   * @returns {Promise<Array>} Array of file metadata objects
   */
  async processFile(file, uuid) {
    const pagesPath = this.getPagesPath(uuid);
    this.ensureDirectoryExists(pagesPath);

    if (file.mimetype === 'application/pdf') {
      return this.processPdfFile(file, pagesPath);
    } else {
      return [this.saveBufferToFile(file.buffer, file.originalname, pagesPath)];
    }
  }

  /**
   * Delete a file from disk
   * @param {string} filePath Path to the file
   * @returns {boolean} True if file was deleted
   */
  deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  /**
   * Read a file from disk
   * @param {string} filePath Path to file
   * @returns {Buffer} File buffer
   */
  readFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return fs.readFileSync(filePath);
  }
}
