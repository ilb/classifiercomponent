import { defaultHandler as handler, fileHandler } from '../../http/handlers.mjs';
import AddPages from './usecases/AddPages.mjs';
import GetPage from './usecases/GetPage.mjs';
import DeletePage from './usecases/DeletePage.mjs';
import CorrectionDocument from './usecases/CorrectPages.mjs';
import nc from 'next-connect';
import { checkMimeType, jfifToJpeg, uploadMiddleware } from '../../http/middlewares.mjs';
import bodyParser from 'body-parser';
import GetDocuments from './usecases/GetDocuments.mjs';
import CheckClassifications from './usecases/CheckClassifications.mjs';
import GetDocument from './usecases/GetDocument.mjs';
import ClassifyPages from './usecases/ClassifyPages.mjs';
import ErrorHandler from '../../http/ErrorHandler.mjs';

/**
 * Creates handler functions for each API endpoint
 * @param {Function} createScope Function to create DI scope
 * @returns {Object} Object with handler functions
 */
const createHandlers = (createScope) => ({
  addPages: async (req, res) => handler(req, res, createScope, AddPages),
  deletePage: async (req, res) => handler(req, res, createScope, DeletePage),
  correctPages: async (req, res) => handler(req, res, createScope, CorrectionDocument),
  getDocuments: async (req, res) => handler(req, res, createScope, GetDocuments),
  classifyPages: async (req, res) => handler(req, res, createScope, ClassifyPages),
  checkClassifications: async (req, res) => handler(req, res, createScope, CheckClassifications),
  getPage: async (req, res) => fileHandler(req, res, createScope, GetPage),
  getDocument: async (req, res) => fileHandler(req, res, createScope, GetDocument)
});

/**
 * Create API middleware for document classification functionality
 * @param {Function} createScope Function to create dependency injection scope
 * @param {Function} onError Custom error handler (optional)
 * @param {Function} onNoMatch Handler for 404 routes (optional)
 * @param {Function} rejectUnauthorized Authorization middleware (optional)
 * @returns {Function} Next.js API middleware
 */
const ClassifierApi = (
  createScope,
  onError = ErrorHandler.ncErrorHandler,
  onNoMatch = (req, res) => res.status(404).end(),
  rejectUnauthorized = (req, res, next) => next()
) => {
  // Create handlers with the given scope factory
  const handlers = createHandlers(createScope);

  // Define API routes
  return nc().use(
    '/api/classifications',
    nc({ attachParams: true, onError, onNoMatch })
      .use(rejectUnauthorized)
      .use(uploadMiddleware.array('documents'))
      .use(checkMimeType)
      .use(jfifToJpeg)
      .use(bodyParser.json())
      .get('/:uuid', handlers.checkClassifications)
      .put('/:uuid', handlers.classifyPages)
      .get('/:uuid/documents', handlers.getDocuments)
      .post('/:uuid/documents/correction', handlers.correctPages)
      .get('/:uuid/documents/:name', handlers.getDocument)
      .put('/:uuid/documents/:name', handlers.addPages)
      .get('/:uuid/documents/:name/:number', handlers.getPage)
      .delete('/:uuid/documents/:name/:pageUuid', handlers.deletePage)
  );
};

export default ClassifierApi;
