import AppConfig from '../config.mjs';

describe('AppConfig', () => {
  let mockEnv;
  let config;

  beforeEach(() => {
    // Create mock environment for testing
    mockEnv = {
      DOSSIER_DOCUMENT_PATH: '/test/documents',
      BASE_URL: 'http://test.example.com',
      POPPLER_BIN_PATH: '/usr/local/bin',
      'apps.classifier.filesize': '50',
      API_PATH: '/test-api'
    };

    // Create config instance with mock environment
    config = new AppConfig(mockEnv);
  });

  describe('initializeConfig', () => {
    it('should initialize config with environment values', () => {
      const result = config.getConfig();

      expect(result.paths.dossier).toBe('/test/documents');
      expect(result.api.baseUrl).toBe('http://test.example.com');
      expect(result.paths.poppler).toBe('/usr/local/bin');
      expect(result.api.apiPath).toBe('/test-api');
    });

    it('should use default values when environment variables are missing', () => {
      const configWithDefaults = new AppConfig({});
      const result = configWithDefaults.getConfig();

      expect(result.paths.dossier).toBe('./documents');
      expect(result.api.baseUrl).toBe('http://localhost:3010');
      expect(result.paths.poppler).toBe('/usr/bin');
      expect(result.api.apiPath).toBe('/api');
    });
  });

  describe('getFileSize', () => {
    it('should return file size in bytes from environment', () => {
      const result = config.getFileSize();

      // 50 MB = 50 * 1024 * 1024 bytes
      expect(result).toBe(52428800);
    });

    it('should return default file size when not specified in environment', () => {
      const configWithDefaults = new AppConfig({});
      const result = configWithDefaults.getFileSize();

      // Default 30 MB = 30 * 1024 * 1024 bytes
      expect(result).toBe(31457280);
    });
  });

  describe('get', () => {
    it('should retrieve nested config values using dot notation', () => {
      expect(config.get('paths.dossier')).toBe('/test/documents');
      expect(config.get('api.baseUrl')).toBe('http://test.example.com');
      expect(config.get('files.maxSize')).toBe(52428800);
    });

    it('should return default value when config path does not exist', () => {
      expect(config.get('nonexistent.path')).toBeNull();
      expect(config.get('nonexistent.path', 'default')).toBe('default');
    });
  });

  describe('validate', () => {
    it('should return valid result when required config is present', () => {
      const result = config.validate();

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors when required config is missing', () => {
      const configWithMissingValues = new AppConfig({});
      const result = configWithMissingValues.validate();

      // Default values should prevent validation errors
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});
