import FailureProcessor from './FailureProcessor.mjs';

export default class StatementsProcessor extends FailureProcessor {
  constructor(type, context) {
    super(type, context);
  }

  isDisplay() {
    return super.isDisplay() && (this.context.LEGAL_GUARANTEE || this.context.RETURNALL);
  }
}
