import FailureProcessor from './FailureProcessor.mjs';

export default class DefenderProcessor extends FailureProcessor {
  constructor(type, context) {
    super(type, context);
  }

  isDisplay() {
    return super.isDisplay() && this.context.DEFENDER;
  }
}
