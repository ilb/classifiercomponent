import { asClass, asValue } from 'awilix';
import DocumentRepository from './DocumentRepository.mjs';
import VerificationRepository from './VerificationRepository.mjs';
import VerificationService from './VerificationService.mjs';
import schema from './schema.mjs';

/**
 * Registry for mock services used in development and testing
 * These implementations provide minimal functionality needed for the application to run
 */
export default {
  // Mock repositories
  documentRepository: asClass(DocumentRepository).singleton(),
  verificationRepository: asClass(VerificationRepository).singleton(),

  // Mock services
  verificationService: asClass(VerificationService).singleton(),

  // Mock data
  dossierSchema: asValue(schema.documents),
  classifierQuantity: asValue(8)
};
