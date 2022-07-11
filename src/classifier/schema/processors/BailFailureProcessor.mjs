import DefaultProcessor from './DefaultProcessor.mjs';

export default class BailFailureProcessor extends DefaultProcessor {
  isReadonly() {
    if (this.context.isFailure && this.context.stateCode === 'BAIL_VERIFICATION') {
      return false;
    }

    return super.isReadonly();
  }
}