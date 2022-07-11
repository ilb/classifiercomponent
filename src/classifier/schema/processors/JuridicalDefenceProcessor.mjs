import FailureProcessor from './FailureProcessor.mjs';

export default class JuridicalDefenceProcessor extends FailureProcessor {
  constructor(type, context) {
    super(type, context);
  }

  isDisplay() {
    return super.isDisplay() && this.context.JURIDICAL_DEFENCE;
  }
}
