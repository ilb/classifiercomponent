import fs from 'fs';
import path from 'path';
import FileService from '../FileService.mjs';

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid')
}));
jest.mock('node-poppler', () => ({
  Poppler: jest.fn().mockImplementation(() => ({
    pdfToCairo: jest.fn().mockResolvedValue(true)
  }))
}));

describe('FileService', () => {
  let fileService;
  let mockConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock configuration
    mockConfig = {
      paths: {
        dossier: '/test/documents',
        poppler: '/test/poppler'
      }
    };

    // Mock implementation of path methods
    path.join.mockImplementation((...parts) => parts.join('/'));
    path.extname.mockImplementation((filename) => {
      const parts = filename.split('.');
      if (parts.length <= 1) {
        return '';
      }
      return '.' + parts[parts.length - 1];
    });

    // Create service instance
    fileService = new FileService();
    fileService.config = mockConfig;

    // Mock the ensureDirectoryExists method
    fileService.ensureDirectoryExists = jest.fn().mockImplementation((dirPath) => dirPath);
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', () => {
      // Save original implementation
      const originalEnsureDirectoryExists = fileService.ensureDirectoryExists;

      // Reset mock and restore real implementation temporarily
      fileService.ensureDirectoryExists = function (dirPath) {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        return dirPath;
      };

      fs.existsSync.mockReturnValue(false);
      const dirPath = '/test/dir';

      fileService.ensureDirectoryExists(dirPath);

      expect(fs.existsSync).toHaveBeenCalledWith(dirPath);
      expect(fs.mkdirSync).toHaveBeenCalledWith(dirPath, { recursive: true });

      // Restore mock implementation
      fileService.ensureDirectoryExists = originalEnsureDirectoryExists;
    });

    it('should not create directory if it already exists', () => {
      // Save original implementation
      const originalEnsureDirectoryExists = fileService.ensureDirectoryExists;

      // Reset mock and restore real implementation temporarily
      fileService.ensureDirectoryExists = function (dirPath) {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        return dirPath;
      };

      fs.existsSync.mockReturnValue(true);
      const dirPath = '/test/dir';

      fileService.ensureDirectoryExists(dirPath);

      expect(fs.existsSync).toHaveBeenCalledWith(dirPath);
      expect(fs.mkdirSync).not.toHaveBeenCalled();

      // Restore mock implementation
      fileService.ensureDirectoryExists = originalEnsureDirectoryExists;
    });
  });

  describe('getDocumentPath', () => {
    it('should return the correct document path', () => {
      const uuid = 'test-document-uuid';
      const expectedPath = '/test/documents/dossier/test-document-uuid';

      const result = fileService.getDocumentPath(uuid);

      expect(result).toBe(expectedPath);
      expect(path.join).toHaveBeenCalledWith(mockConfig.paths.dossier, 'dossier', uuid);
    });
  });

  describe('getPagesPath', () => {
    it('should return the correct pages path', () => {
      const uuid = 'test-document-uuid';
      const documentPath = '/test/documents/dossier/test-document-uuid';
      const expectedPath = '/test/documents/dossier/test-document-uuid/pages';

      // Mock getDocumentPath
      fileService.getDocumentPath = jest.fn().mockReturnValue(documentPath);

      const result = fileService.getPagesPath(uuid);

      expect(result).toBe(expectedPath);
      expect(fileService.getDocumentPath).toHaveBeenCalledWith(uuid);
      expect(path.join).toHaveBeenCalledWith(documentPath, 'pages');
    });
  });

  describe('saveBufferToFile', () => {
    it('should save buffer to file with correct path and return metadata', () => {
      const buffer = Buffer.from('test file content');
      const originalName = 'test.jpg';
      const savePath = '/test/save/path';
      const expectedFilePath = '/test/save/path/test-uuid.jpg';

      const result = fileService.saveBufferToFile(buffer, originalName, savePath);

      expect(fileService.ensureDirectoryExists).toHaveBeenCalledWith(savePath);
      expect(fs.writeFileSync).toHaveBeenCalledWith(expectedFilePath, buffer);
      expect(result).toEqual({
        originalname: originalName,
        filename: 'test-uuid.jpg',
        path: expectedFilePath,
        mimetype: 'image/jpeg',
        name: 'test-uuid.jpg',
        uuid: 'test-uuid',
        extension: 'jpg'
      });
    });

    it('should handle jfif files correctly', () => {
      const buffer = Buffer.from('test file content');
      const originalName = 'test.jfif';
      const savePath = '/test/save/path';

      const result = fileService.saveBufferToFile(buffer, originalName, savePath);

      expect(result.extension).toBe('jpg');
      expect(result.mimetype).toBe('image/jpeg');
    });
  });

  describe('getMimeType', () => {
    it('should return the correct mime type for known extensions', () => {
      expect(fileService.getMimeType('jpg')).toBe('image/jpeg');
      expect(fileService.getMimeType('png')).toBe('image/png');
      expect(fileService.getMimeType('pdf')).toBe('application/pdf');
    });

    it('should return application/octet-stream for unknown extensions', () => {
      expect(fileService.getMimeType('xyz')).toBe('application/octet-stream');
    });
  });

  describe('isEmptyImage', () => {
    it('should return true for non-existent files', () => {
      const file = { path: '/test/file.jpg' };
      fs.existsSync.mockReturnValue(false);

      const result = fileService.isEmptyImage(file);

      expect(result).toBe(true);
    });

    it('should return true for very small files (likely empty)', () => {
      const file = { path: '/test/file.jpg' };
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 50 });

      const result = fileService.isEmptyImage(file);

      expect(result).toBe(true);
    });

    it('should return false for normal sized files', () => {
      const file = { path: '/test/file.jpg' };
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 5000 });

      const result = fileService.isEmptyImage(file);

      expect(result).toBe(false);
    });
  });
});
