import DocumentService from '../core/DocumentService.mjs';
import DocumentPathService from '../../../services/DocumentPathService.mjs';

/**
 * CorrectPages use case for reorganizing pages between documents
 */
export default class CorrectPages {
  /**
   * @param {DossierBuilder} dossierBuilder
   * @param sqliteDbPath
   */
  constructor({ dossierBuilder, sqliteDbPath }) {
    this.documentService = new DocumentService(dossierBuilder);
    this.dossierBuilder = dossierBuilder;
    this.documentPathService = new DocumentPathService(sqliteDbPath);
  }

  /**
   * Process page corrections (moves pages between documents)
   *
   * @param {string} uuid Document UUID
   * @param {Object} corrections Page correction instructions
   * @return {Promise<void>}
   */
  async process({ uuid, ...corrections }) {
    const uuidPath = await this.documentPathService.getPath(uuid);
    const dossier = await this.dossierBuilder.build(uuidPath);

    await Promise.all(
      Object.values(corrections).map(async (correction) => {
        await this.processCorrection(correction, dossier);
      })
    );
  }

  /**
   * Process a single correction
   *
   * @param {Object} correction The correction to process
   * @param {Object} dossier The document dossier
   * @returns {Promise<void>}
   */
  async processCorrection(correction, dossier) {
    const { from, to } = correction;

    // Skip if no change or no destination
    if (this.shouldSkipCorrection(from, to)) {
      return;
    }

    // Handle same-document move
    if (from.class === to.class) {
      await this.processSameDocumentMove(from, to, dossier);
    } else {
      // Handle cross-document move
      await this.processCrossDocumentMove(from, to, dossier);
    }
  }

  /**
   * Check if a correction should be skipped
   *
   * @param {Object} from Source location
   * @param {Object} to Destination location
   * @returns {boolean} True if correction should be skipped
   */
  shouldSkipCorrection(from, to) {
    return (from.class === to.class && from.page === to.page) || !to.page;
  }

  /**
   * Process a move within the same document
   *
   * @param {Object} from Source location
   * @param {Object} to Destination location
   * @param {Object} dossier The document dossier
   * @returns {Promise<void>}
   */
  async processSameDocumentMove(from, to, dossier) {
    const document = dossier.getDocument(from.class);
    await document.movePage(from.page, to.page);
  }

  /**
   * Process a move between different documents
   *
   * @param {Object} from Source location
   * @param {Object} to Destination location
   * @param {Object} dossier The document dossier
   * @returns {Promise<void>}
   */
  async processCrossDocumentMove(from, to, dossier) {
    const fromDocument = await dossier.getDocument(from.class);
    const toDocument = await dossier.getDocument(to.class);

    await this.documentService.movePage(fromDocument, from.page, toDocument, to.page);
  }
}
