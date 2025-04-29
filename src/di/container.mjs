import awilix, { asClass, asValue } from 'awilix';
import { DossierBuilder } from '@ilb/dossierjs';
import { appConfig } from '../config/config.mjs';
import FileService from '../services/FileService.mjs';
import DocumentRepository from '../repository/DocumentRepository.mjs';
import DocumentService from '../classifier/server/core/DocumentService.mjs';
import mockRegistry from '../mocks/registry.mjs';

/**
 * Create a dependency injection container for the application
 * Centralizes service registration and lifetime management
 */
export default class Container {
  /**
   * Initialize a container with optional test overrides
   * @param {Object} overrides Test override values
   * @returns {Object} Container instance
   */
  static create(overrides = {}) {
    const container = awilix.createContainer({
      injectionMode: awilix.InjectionMode.PROXY
    });

    // Register all services
    container.register({
      // Config
      config: asValue(appConfig.getConfig()),

      // Core services
      fileService: asClass(FileService).singleton(),
      documentRepository: asClass(DocumentRepository).singleton(),
      documentService: asClass(DocumentService).singleton(),
      dossierBuilder: asClass(DossierBuilder).singleton(),

      // Environment values
      classifierQuantity: asValue(appConfig.get('classification.classifierQuantity', 8)),

      // Use mock implementations for verification services
      // These can be overridden in production
      ...mockRegistry,

      // Override with test mocks when provided
      ...overrides
    });

    return container;
  }

  /**
   * Create a request-scoped container
   * @param {Object} req Express request object
   * @param {Object} overrides Additional registrations
   * @returns {Object} Scoped container
   */
  static createScope(req = {}, overrides = {}) {
    const container = Container.create();

    // Create a request-specific scope
    const scope = container.createScope();

    // Add request-specific registrations
    scope.register({
      req: asValue(req),
      ...overrides
    });

    return scope;
  }
}
