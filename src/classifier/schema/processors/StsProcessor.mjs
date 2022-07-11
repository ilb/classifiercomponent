import BailFailureProcessor from './BailFailureProcessor.mjs';

export default class StsProcessor extends BailFailureProcessor {
  constructor(type, context) {
    super(type, context);
  }

  isRequired() {
    const { vehicleType, bailElectronicPTS } = this.context;

    if (vehicleType === 'AUTO_USED' && bailElectronicPTS === true) {
      return true;
    }

    return super.isRequired();
  }
}
