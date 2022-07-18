import ClassifierProcessor from './processors/ClassifierProcessor.mjs';
import OfferFailureProcessor from './processors/OfferFailureProcessor.mjs';
import { TabProcessor } from '../client.js';

export default {
  undefined: TabProcessor,
  DefaultProcessor: TabProcessor,
  ClassifierProcessor: ClassifierProcessor,
  OfferFailureProcessor: OfferFailureProcessor,
};
