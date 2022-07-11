import AgreementFailureProcessor from './AgreementFailureProcessor.mjs';

export default class KaskoProcessor extends AgreementFailureProcessor {
  constructor(type, context) {
    super(type, context);
  }

  isRequired() {
    return this.context.kaskoAmount > 0;
  }

  isDisplay() {
    return super.isDisplay();
    // return super.isDisplay() && this.context.INSURANCE_KASKO;
  }
}
