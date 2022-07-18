import awilix, { asClass, asValue } from 'awilix';
import DossierBuilder from '../dossier/core/DossierBuilder.mjs';
import DocumentRepository from '../mocks/DocumentRepository.mjs';
import schema from '../mocks/schema.mjs';
import EventFactory from '../mocks/dossier/EventFactory.mjs';
import VerificationRepository from '../mocks/VerificationRepository.mjs';

export const createScope = () => {
  const container = awilix.createContainer();

  container.register({
    'documentRepository': asClass(DocumentRepository),
    'verificationRepository': asClass(VerificationRepository),
    'dossierBuilder': asClass(DossierBuilder),
    'dossierSchema': asValue(schema.documents),
  })

  const scope = container.createScope();

  new EventFactory(scope.cradle).build();

  return scope;
}