import AgreementFailureProcessor from './AgreementFailureProcessor.mjs';

export default class AdditionEquipmentProcessor extends AgreementFailureProcessor {
  isRequired() {
    return this.context.equipmentPrice > 0;
  }

  isReadonly() {
    if (!this.context.equipmentPrice && this.context.stateCode === 'DEAL_PROCESSING') {
      return true;
    }

    return super.isReadonly();
  }
}
