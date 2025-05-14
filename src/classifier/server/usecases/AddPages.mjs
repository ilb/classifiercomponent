import { Page } from '@ilb/dossierjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import * as node_path from 'path';
import { Poppler } from 'node-poppler';
import sharp from 'sharp';
import DocumentPathService from '../../../services/DocumentPathService.mjs';

/**
 * AddPages use case for adding pages to documents
 * Handles uploading and processing document pages
 */
export default class AddPages {
  /**
   * @param {DossierBuilder} dossierBuilder
   * @param {DocumentPathRepository} documentPathRepository
   */
  constructor({ dossierBuilder, documentPathRepository }) {
    this.dossierBuilder = dossierBuilder;
    this.documentPathService = new DocumentPathService({ documentPathRepository });
  }

  /**
   * Process the request to add pages to a document
   *
   * @param {string} uuid Document UUID
   * @param {string} name Document name/type
   * @param {object} files Files to add
   * @return {Promise<*>}
   */
  async process({ uuid, name, ...files }) {
    // Return early if no files to process
    if (!Object.keys(files).length) {
      return;
    }

    try {
      const uuidPath = await this.documentPathService.getPath(uuid);
      const pagesPath = this.prepareDirectories(uuidPath);
      const nonEmptyFiles = await this.filterNonEmptyFiles(Object.values(files));
      const processedFiles = await this.processAllFiles(nonEmptyFiles, pagesPath);

      if (!processedFiles.length) {
        return;
      }

      await this.addFilesToDocument(uuidPath, name, processedFiles);
    } catch (error) {
      console.error(`Error adding pages to document ${name} (${uuid}):`, error);
      throw error; // Re-throw to let the caller handle it
    }
  }

  /**
   * Prepare the necessary directories for file storage
   * @param {string} uuid Document UUID
   * @returns {string} Path to the pages directory
   */
  prepareDirectories(uuidPath) {
    const documentPath = this.ensureDocumentPath(uuidPath);
    const pagesPath = node_path.join(documentPath, 'pages');

    if (!fs.existsSync(pagesPath)) {
      fs.mkdirSync(pagesPath, { recursive: true });
    }

    return pagesPath;
  }

  /**
   * Process all files in the request
   * @param {object} files Files object from the request
   * @param {string} pagesPath Path to save the processed files
   * @returns {Promise<Array>} Array of processed file objects
   */
  async processAllFiles(files, pagesPath) {
    // Get files array from the files object
    const filesList = Object.values(files);

    // Process each file based on its type
    const processedFilesNested = await Promise.all(
      filesList.map(async (file) => {
        if (file.mimetype === 'application/pdf') {
          return this.processPdf(file, pagesPath);
        } else {
          return this.processRegularFile(file, pagesPath);
        }
      })
    );

    // Flatten the array (PDF processing returns arrays)
    return processedFilesNested.flat();
  }

  /**
   * Add processed files to the document
   * @param {string} uuidPath Document path
   * @param {string} name Document name/type
   * @param {Array} processedFiles Array of processed file objects
   * @returns {Promise<void>}
   */
  async addFilesToDocument(uuidPath, name, processedFiles) {
    // Build the dossier
    const dossier = await this.dossierBuilder.build(uuidPath);
    const document = dossier.getDocument(name);

    // Clear document if needed (when file type changes)
    const isImageType = processedFiles[0].mimetype.includes('image/');
    const documentNeedsClearing = !isImageType || !document.isImages();

    if (documentNeedsClearing) {
      await document.clear();
    }

    // Convert file objects to Page objects and add them to the document
    const pages = processedFiles.map((file) => new Page(file));
    await document.addPages(pages);
  }

  /**
   * Processes a PDF file by splitting it into image pages
   * @param {Object} file The PDF file object
   * @param {string} pagesPath The path to save the pages
   * @returns {Promise<Array>} Array of processed page objects
   */
  async processPdf(file, pagesPath) {
    const poppler = new Poppler(process.env.POPPLER_BIN_PATH);
    const fileUuid = uuidv4();
    const tmpFilePath = node_path.join(pagesPath, `${fileUuid}.pdf`);
    const splitOutputPath = node_path.join(pagesPath, fileUuid);

    // Ensure split output directory exists
    fs.mkdirSync(splitOutputPath, { recursive: true });

    // Save PDF to disk temporarily
    fs.writeFileSync(tmpFilePath, file.buffer);

    try {
      // Use poppler to convert PDF to images
      await poppler.pdfToCairo(
        tmpFilePath,
        node_path.join(splitOutputPath, file.originalname.split('.')[0]),
        {
          jpegFile: true
        }
      );

      // Read the generated image files
      const pages = fs.readdirSync(splitOutputPath);

      // Process each page
      const processedPages = pages.map((page) => {
        const pageUuid = uuidv4();
        const filename = `${pageUuid}.jpg`;
        const pagePath = node_path.join(pagesPath, filename);

        // Rename the file to use the UUID
        fs.renameSync(node_path.join(splitOutputPath, page), pagePath);

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

      return processedPages;
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
   * Processes a regular file (non-PDF)
   * @param {Object} file The file object
   * @param {string} pagesPath The path to save the file
   * @returns {Object} The processed file object
   */
  processRegularFile(file, pagesPath) {
    // Generate UUID for the file
    const fileUuid = uuidv4();
    const extension = file.originalname.split('.').pop().toLowerCase();
    const filename = `${fileUuid}.${extension}`;
    const filePath = node_path.join(pagesPath, filename);

    // Handle jfif extension
    const actualExtension = extension === 'jfif' ? 'jpg' : extension;
    const actualFilename = extension === 'jfif' ? `${fileUuid}.jpg` : filename;
    const actualFilePath =
      extension === 'jfif' ? node_path.join(pagesPath, actualFilename) : filePath;

    // Save the file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Rename if it's a jfif file
    if (extension === 'jfif') {
      fs.renameSync(filePath, actualFilePath);
    }

    // Handle image conversions (bmp, tiff, heic to jpg)
    if (['bmp', 'tiff', 'heic'].includes(extension)) {
      // TODO: Implement image conversion logic if needed
      // For now, we'll just pretend it was converted
      return {
        originalname: file.originalname,
        filename: `${fileUuid}.jpg`,
        path: actualFilePath,
        mimetype: 'image/jpeg',
        name: `${fileUuid}.jpg`,
        uuid: fileUuid,
        extension: 'jpg'
      };
    }

    return {
      originalname: file.originalname,
      filename: actualFilename,
      path: actualFilePath,
      mimetype: file.mimetype,
      name: actualFilename,
      uuid: fileUuid,
      extension: actualExtension
    };
  }

  /**
   * Ensures that the document path exists for the given UUID
   * Using only the old structure
   *
   * @param {string} path file path
   * @returns {string} The full document path
   */
  ensureDocumentPath(path) {
    const documentPath = `${process.env.DOSSIER_DOCUMENT_PATH}/dossier`;

    path = node_path.join(documentPath, path);

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    return path;
  }

  async filterNonEmptyFiles(files) {
    const filteredFiles = await Promise.all(
      files.map(async (file) => {
        if (!file.mimetype?.startsWith('image/')) {
          return file;
        }

        try {
          const image = sharp(file.buffer);
          const stats = await image.stats();

          // Анализ статистики цвета
          const channels = stats.channels;
          const isMostlyOneColor = channels.some((ch) => ch.max === ch.min && ch.max > 0);

          return isMostlyOneColor ? null : file;
        } catch (error) {
          console.error(`Error processing ${file.originalname}:`, error);
          return file;
        }
      })
    );

    return filteredFiles.filter(Boolean);
  }
}
