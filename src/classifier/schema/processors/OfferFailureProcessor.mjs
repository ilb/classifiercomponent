import DefaultProcessor from './DefaultProcessor.mjs';

export default class OfferFailureProcessor extends DefaultProcessor {
  isReadonly() {
    if (this.context.isFailure && this.context.stateCode === 'ON_CHECK') {
      return false;
    }

    return super.isReadonly();
  }
}