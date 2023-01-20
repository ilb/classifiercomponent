import nc from 'next-connect';
import { uploadMiddleware, splitPdf } from '../../http/middlewares.mjs';
import bodyParser from 'body-parser';

const ClassifierApi = (createScope, onError, onNoMatch) => {
  return nc().use(
    '/api/classifications',
    nc({ attachParams: true, onError, onNoMatch })
      .use(uploadMiddleware.array('documents'))
      .use(splitPdf)
      // .use(compressImages)
      .use(bodyParser.json()),
  );
};

export default ClassifierApi;
