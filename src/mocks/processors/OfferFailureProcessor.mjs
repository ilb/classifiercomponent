import { TabProcessor } from '../../client.js';

export default class OfferFailureProcessor extends TabProcessor {
  isReadonly() {
    if (this.context.isFailure && this.context.stateCode === 'ON_CHECK') {
      return false;
    }

    return super.isReadonly();
  }
}