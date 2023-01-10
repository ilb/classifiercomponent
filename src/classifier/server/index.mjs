import { defaultHandler, fileHandler } from '../../http/handlers.mjs';
import nc from 'next-connect';
import { uploadMiddleware, splitPdf } from '../../http/middlewares.mjs';
import bodyParser from 'body-parser';
import CheckClassifications from './usecases/CheckClassifications.mjs';
import ClassifyPages from './usecases/ClassifyPages.mjs';

const ClassifierApi = (createScope, onError, onNoMatch) => {
  const classifyPages = async (req, res) => defaultHandler(req, res, createScope, ClassifyPages);
  const checkClassifications = async (req, res) =>
    defaultHandler(req, res, createScope, CheckClassifications);


  return nc().use(
    '/api/classifications',
    nc({ attachParams: true, onError, onNoMatch })
      .use(uploadMiddleware.array('documents'))
      .use(splitPdf)
      // .use(compressImages)
      .use(bodyParser.json())
      .get('/:uuid', checkClassifications)
      .put('/:uuid', classifyPages)
  );
};

export default ClassifierApi;
