import { TabProcessor } from '../../client.js';

export default class ClassifierProcessor extends TabProcessor {
  constructor(type, context) {
    super(type, context);
  }

  isDisplay() {
    if (this.context.isFailure) {
      return true;
    }

    return super.isDisplay();
  }
}
