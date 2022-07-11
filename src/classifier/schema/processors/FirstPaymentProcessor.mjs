import AgreementFailureProcessor from './AgreementFailureProcessor.mjs';

export default class FirstPaymentProcessor extends AgreementFailureProcessor {
  constructor(type, context) {
    super(type, context);
  }

  isRequired() {
    return this.context.creditInitialPayment > 0;
  }

  isDisplay() {
    return super.isDisplay();
    // return super.isDisplay() && this.context.creditInitialPayment > 0;
  }
}
