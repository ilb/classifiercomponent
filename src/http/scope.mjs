import Container from '../di/container.mjs';
import EventFactory from '../mocks/dossier/EventFactory.mjs';

/**
 * Create a request scope with properly initialized dependencies
 * @param {Object} req Express request object
 * @returns {Object} Scoped container
 */
export const createScope = (req = {}) => {
  // Create a new request scope
  const scope = Container.createScope(req);

  // Initialize event handlers
  new EventFactory(scope.cradle).build();

  return scope;
}