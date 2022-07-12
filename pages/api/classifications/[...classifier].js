import Classifier from '../../../src/classifier/server/index.mjs';
import { createScope } from '../../../src/http/scope.mjs';

export const config = {
  api: {
    bodyParser: false
  }
};

export default Classifier(createScope);
