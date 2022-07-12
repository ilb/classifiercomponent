import { processUsecaseApiInstance2 } from '../../http/handlers.mjs';
import AddPages from './usecases/AddPages.mjs';
import GetPage from './usecases/GetPage.mjs';
import DeletePage from './usecases/DeletePage.mjs';
import CorrectionDocument from './usecases/CorrectionDocuments.mjs';
import nc from 'next-connect';
import { onError, onNoMatch, uploadMiddleware } from '../../http/middlewares.mjs';
import bodyParser from 'body-parser';
import GetDocuments from './usecases/GetDocuments.mjs';
import CheckClassifications from './usecases/CheckClassifications.mjs';
import GetDocument from './usecases/GetDocument.mjs';
import { convertToJpeg, splitPdf } from '../../http/middlewares.mjs';
import ClassifyPages from './usecases/ClassifyPages.mjs';

const Classifier = (createScope) => {
  const getDocumentsIndex = async (req, res) => {
    const context = { query: { ...req.params, ...req.body }, req };
    const scope = await createScope(context.req);
    const usecase = new GetDocuments(scope.cradle);
    const { httpCode, data } = await processUsecaseApiInstance2(context, usecase);

    res.status(httpCode).json(data);
  };

  const classify = async (req, res) => {
    const context = { query: { ...req.params, ...req.files, ...req.body }, req };
    const scope = await createScope(context.req);
    const usecase = new ClassifyPages(scope.cradle);
    const { httpCode, data, contentType } = await processUsecaseApiInstance2(context, usecase);

    res.setHeader('Content-Type', contentType);
    res.status(httpCode).send(data);
  };

  const uploadPages = async (req, res) => {
    const context = { query: { ...req.params, ...req.files }, req };
    const scope = await createScope(context.req);
    const usecase = new AddPages(scope.cradle);
    const { httpCode, data, contentType } = await processUsecaseApiInstance2(context, usecase);

    res.setHeader('Content-Type', contentType);
    res.status(httpCode).send(data);
  };

  const correctDocument = async (req, res) => {
    const context = { query: { ...req.params, ...req.body }, req };
    const scope = await createScope(context.req);
    const usecase = new CorrectionDocument(scope.cradle);
    const { httpCode, data, contentType } = await processUsecaseApiInstance2(context, usecase);
    res.setHeader('Content-Type', contentType);
    res.status(httpCode).send(data);
  };

  const getDocumentPage = async (req, res) => {
    const context = { query: { ...req.params, ...req.body }, req };
    const scope = await createScope(context.req);
    const usecase = new GetPage(scope.cradle);
    const { data } = await processUsecaseApiInstance2(context, usecase);

    res.setHeader('Content-Type', data.contentType);
    res.setHeader('Content-Length', Buffer.byteLength(data.document));
    const attachmentName = encodeURIComponent(data.info.name);
    const contentDisposition = `${
      res.contentDisposition || 'attachment'
    }; filename*=UTF-8''${attachmentName}`;
    res.setHeader('Content-Disposition', contentDisposition);
    res.send(data.document);
  };

  const deleteDocumentPage = async (req, res) => {
    const context = { query: { ...req.params, ...req.body }, req };
    const scope = await createScope(context.req);
    const usecase = new DeletePage(scope.cradle);
    const { httpCode, data, contentType } = await processUsecaseApiInstance2(context, usecase);
    res.setHeader('Content-Type', contentType);
    res.status(httpCode).send(data);
  };

  const getDocument = async (req, res) => {
    const context = { query: { ...req.params, ...req.body }, req };
    const scope = await createScope(context.req);
    const usecase = new GetDocument(scope.cradle);
    const { data } = await processUsecaseApiInstance2(context, usecase);
    const { file, mimeType, extension, filename } = data;

    res.setHeader('Content-Length', file.length);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.${extension}`);
    res.write(file, 'binary');
    res.end();
  };

  const checkClassifications = async (req, res) => {
    const context = { query: { ...req.params, ...req.body }, req };
    const scope = await createScope(context.req);
    const usecase = new CheckClassifications(scope.cradle);
    const { httpCode, data, contentType } = await processUsecaseApiInstance2(context, usecase);
    res.setHeader('Content-Type', contentType);
    res.status(httpCode).send(data);
  };

  return nc().use(
    '/api/classifications',
    nc({ attachParams: true, onError, onNoMatch })
      .use(uploadMiddleware.array('documents'))
      .use(splitPdf)
      .use(convertToJpeg)
      .use(bodyParser.json())
      .put('/:uuid', classify)
      .get('/:uuid', checkClassifications)
      .get('/:uuid/documents', getDocumentsIndex)
      .post('/:uuid/documents/correction', correctDocument)
      .get('/:uuid/documents/:name', getDocument)
      .put('/:uuid/documents/:name', uploadPages)
      .get('/:uuid/documents/:name/:number', getDocumentPage)
      .delete('/:uuid/documents/:name/:pageUuid', deleteDocumentPage)
  );
};

export default Classifier;
