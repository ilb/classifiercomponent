/**
 * Application configuration module
 * Centralizes configuration management and validation
 */
export default class AppConfig {
  constructor(env = process.env) {
    this.env = env;
    this.config = this.initializeConfig();
  }

  /**
   * Initialize configuration with default values and environment overrides
   * @returns {Object} The complete configuration object
   */
  initializeConfig() {
    return {
      paths: {
        dossier: this.env.DOSSIER_DOCUMENT_PATH || './documents',
        poppler: this.env.POPPLER_BIN_PATH || '/usr/bin'
      },
      api: {
        baseUrl: this.env.BASE_URL || 'http://localhost:3010',
        apiPath: this.env.API_PATH || '/api'
      },
      files: {
        maxSize: this.getFileSize(),
        allowedTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'image/bmp',
          'image/tiff',
          'image/heic'
        ]
      },
      database: {
        documentPathDb:
          this.env.DOCUMENT_PATH_DB ||
          `${this.env.DOSSIER_DOCUMENT_PATH || './documents'}/document_paths.db`
      },
      classification: {
        classifierQuantity: parseInt(this.env.CLASSIFIER_QUANTITY || '8', 10)
      }
    };
  }

  /**
   * Get the configured maximum file size in bytes
   * @returns {number} Maximum file size in bytes
   */
  getFileSize() {
    const defaultSize = 30 * 1024 * 1024; // 30 MB
    if (this.env['apps.classifier.filesize']) {
      return parseInt(this.env['apps.classifier.filesize'], 10) * 1024 * 1024;
    }
    return defaultSize;
  }

  /**
   * Get the full configuration object
   * @returns {Object} The complete configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get a specific configuration value by key path
   * @param {string} keyPath Dot-notation path to configuration value
   * @param {*} defaultValue Default value if configuration not found
   * @returns {*} The configuration value or default
   */
  get(keyPath, defaultValue = null) {
    const keys = keyPath.split('.');
    let result = this.config;

    for (const key of keys) {
      if (result === undefined || result === null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined ? result : defaultValue;
  }

  /**
   * Validate that all required configuration is present
   * @returns {Object} Object with validation result and any errors
   */
  validate() {
    const errors = [];

    // Required configuration checks
    if (!this.config.paths.dossier) {
      errors.push('Missing DOSSIER_DOCUMENT_PATH configuration');
    }

    if (!this.config.api.baseUrl) {
      errors.push('Missing BASE_URL configuration');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance for application-wide use
export const appConfig = new AppConfig();
