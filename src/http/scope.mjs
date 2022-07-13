import awilix, { asClass, asValue, Lifetime } from 'awilix';
import DocumentService from '../classifier/server/core/DocumentService.mjs';
import ClassifierGate from '../classifier/server/gates/ClassifierGate.mjs';
import DossierBuilder from '../dossier/core/DossierBuilder.mjs';
import DocumentRepository from '../mocks/DocumentRepository.mjs';
import schema from '../mocks/schema.mjs';
import MessageBus from '../dossier/core/MessageBus.mjs';
import matching from '../mocks/matching.mjs';
import CustomEmitter from '../dossier/core/CustomEmitter.mjs';
import EventFactory from '../mocks/dossier/EventFactory.mjs';
import queue from '../pqueue/pqueue.mjs';
import VerificationRepository from '../mocks/VerificationRepository.mjs';
import DocumentMerger from '../services/DocumentMerger.mjs';

export const createScope = () => {
  const container = awilix.createContainer();

  container.register({
    'classifierDocumentService': asClass(DocumentService),
    'documentRepository': asClass(DocumentRepository),
    'verificationRepository': asClass(VerificationRepository),
    'classifierGate': asClass(ClassifierGate),
    'dossierBuilder': asClass(DossierBuilder),
    'documentMerger': asClass(DocumentMerger),
    'eventsEmitter': asClass(CustomEmitter).setLifetime(Lifetime.SCOPED),
    'messageBus': asClass(MessageBus),
    'classifierTimeout': asValue(30),
    'signaturerecognitionUrl': asValue(process.env['apps.signaturerecognition.ws']),
    'classifierUrl': asValue(process.env['apps.classifier.ws']),
    'classifierSchema': asValue(schema),
    'dossierSchema': asValue(schema.documents),
    'matching': asValue(matching),
    'queue': asValue(queue),
    'documentsPath': asValue('documents'),
    'dossierPath': asValue('documents/dossier'),
  })

  const scope = container.createScope();

  new EventFactory(scope.cradle).build();

  return scope;
}