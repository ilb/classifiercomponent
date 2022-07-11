import ClassifierProcessor from './processors/ClassifierProcessor.mjs';
import FailureProcessor from './processors/FailureProcessor.mjs';
import StsProcessor from './processors/StsProcessor.mjs';
import StatementsProcessor from './processors/StatementsProcessor.mjs';
import DefenderProcessor from './processors/DefenderProcessor.mjs';
import JuridicalDefenceProcessor from './processors/JuridicalDefenceProcessor.mjs';
import KaskoProcessor from './processors/KaskoProcessor.mjs';
import FirstPaymentProcessor from './processors/FirstPaymentProcessor.mjs';
import OfferFailureProcessor from './processors/OfferFailureProcessor.mjs';
import BailFailureProcessor from './processors/BailFailureProcessor.mjs';
import AgreementFailureProcessor from './processors/AgreementFailureProcessor.mjs';
import DefaultProcessor from './processors/DefaultProcessor';
import AdditionEquipmentProcessor from './processors/AdditionEquipmentProcessor.mjs';

export default {
  undefined: DefaultProcessor,
  DefaultProcessor: DefaultProcessor,
  ClassifierProcessor: ClassifierProcessor,

  StsProcessor: StsProcessor,

  StatementsProcessor: StatementsProcessor,
  DefenderProcessor: DefenderProcessor,
  JuridicalDefenceProcessor: JuridicalDefenceProcessor,

  KaskoProcessor: KaskoProcessor,
  FirstPaymentProcessor: FirstPaymentProcessor,

  FailureProcessor: FailureProcessor,
  OfferFailureProcessor: OfferFailureProcessor,
  BailFailureProcessor: BailFailureProcessor,
  AgreementFailureProcessor: AgreementFailureProcessor,
  AdditionEquipmentProcessor: AdditionEquipmentProcessor,
};
