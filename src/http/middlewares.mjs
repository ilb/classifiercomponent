import multer from 'multer';
import mime from 'mime-types';

// Use memory storage for multer to store files in memory
export const uploadMiddleware = multer({
  limits: {
    fileSize: process.env['apps.classifier.filesize']
      ? process.env['apps.classifier.filesize'] * 1024 * 1024
      : 30 * 1024 * 1024
  },
  storage: multer.memoryStorage() // Use memory storage instead of disk storage
});

export const splitPdf = async (req, res, next) => {
  // We're no longer saving files in middleware, so this function is simplified
  // PDF splitting will be handled in AddPages
  next();
};

//https://github.com/jshttp/mime-db/pull/291 когда выложат, нужно будет обновить библиотеку и убрать данную функию
export const jfifToJpeg = async (req, res, next) => {
  req.files = req.files?.map((file) => {
    if (/\.jfif$/.test(file.originalname)) {
      return {
        ...file,
        originalname: file.originalname.replace('.jfif', '.jpg')
      };
    }
    return file;
  });
  next();
};

export const convertToJpeg = async (req, res, next) => {
  // Conversion will be handled in AddPages
  req.files = req.files?.map((file) => {
    if (['image/bmp', 'image/tiff', 'image/heic'].includes(file.mimetype)) {
      return {
        ...file,
        mimetype: 'image/jpeg'
      };
    }
    return file;
  });
  next();
};

// Проверка на получение тип документа
export const checkMimeType = async (req, res, next) => {
  // Filter out files with invalid MIME types
  req.files = req.files?.filter((file) => {
    const extension = file.originalname.split('.').pop();
    const firstPageMimeType = mime.lookup(extension);
    if (!firstPageMimeType) {
      console.error(`Возникла проблема с файлом: ${file.originalname}`);
      return false;
    }
    return true;
  });
  next();
};
