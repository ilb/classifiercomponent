import DefaultProcessor from './DefaultProcessor.mjs';

export default class AgreementFailureProcessor extends DefaultProcessor {
  isReadonly() {
    if (this.context.isFailure && this.context.stateCode === 'FORMATION_AGREEMENT') {
      return false;
    }

    return super.isReadonly();
  }
}