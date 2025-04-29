import Response from './Response.mjs';
import ErrorHandler from './ErrorHandler.mjs';

/**
 * Handler for regular API endpoints
 * @param {Object} req Express request
 * @param {Object} res Express response
 * @param {Function} createScope Function to create DI scope
 * @param {Class} usecase Usecase class to instantiate
 * @returns {Promise<void>}
 */
export async function defaultHandler(req, res, createScope, usecase) {
  try {
    const context = { query: { ...req.params, ...req.body, ...req.files }, req };
    const scope = await createScope(context.req);
    const instance = new usecase(scope.cradle);
    const result = await instance.process(context.query);
    const response = buildResponse(result);

    res.setHeader('Content-Type', response.contentType);
    res.status(response.httpCode).send(response.data);
  } catch (err) {
    const errorResponse = ErrorHandler.handleError(err);
    res.status(errorResponse.httpCode)
      .setHeader('Content-Type', errorResponse.contentType)
      .send(errorResponse.data);
  }
}

/**
 * Handler for file download endpoints
 * @param {Object} req Express request
 * @param {Object} res Express response
 * @param {Function} createScope Function to create DI scope
 * @param {Class} usecase Usecase class to instantiate
 * @returns {Promise<void>}
 */
export async function fileHandler(req, res, createScope, usecase) {
  try {
    const context = { query: { ...req.params, ...req.body }, req };
    const scope = await createScope(context.req);
    const instance = new usecase(scope.cradle);
    const result = await instance.process(context.query);
    const { file, mimeType, filename } = result;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', file.length);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(file);
  } catch (err) {
    const errorResponse = ErrorHandler.handleError(err);
    res.status(errorResponse.httpCode)
      .setHeader('Content-Type', errorResponse.contentType)
      .send(errorResponse.data);
  }
}

/**
 * Build a standardized response object
 * @param {*} result Result from usecase process
 * @returns {Object} Formatted response
 */
const buildResponse = (result) => {
  if (result) {
    const contentType = typeof result === 'string' ? 'text/plain' : 'application/json';
    return Response.ok(result, contentType);
  } else {
    return Response.noContent();
  }
}