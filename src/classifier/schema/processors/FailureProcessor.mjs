import DefaultProcessor from './DefaultProcessor.mjs';

export default class FailureProcessor extends DefaultProcessor {
  constructor(type, context) {
    super(type, context);
  }

  isReadonly() {
    if (this.context.isFailure) {
      return false;
    }

    return super.isReadonly();
  }
}
