import ClassifierProcessor from './processors/ClassifierProcessor.mjs';
import OfferFailureProcessor from './processors/OfferFailureProcessor.mjs';
import DefaultProcessor from '../classifier/schema/processors/DefaultProcessor.mjs';

export default {
  undefined: DefaultProcessor,
  DefaultProcessor: DefaultProcessor,
  ClassifierProcessor: ClassifierProcessor,
  OfferFailureProcessor: OfferFailureProcessor,
};
