import { InfoError, StatusError } from '../util/Errors.mjs';
import errormailer from '@ilb/mailer/src/errormailer';

const { notify } = errormailer;

/**
 * Centralized error handling for HTTP requests
 * Provides consistent error responses
 */
export default class ErrorHandler {
  /**
   * Create standardized error responses
   * @param {Error} error The error to process
   * @returns {Object} Formatted error response
   */
  static handleError(error) {
    // Log error for monitoring
    console.error(`[ERROR] ${error.message}`, error);

    // Notify about the error via email
    notify(error).catch(console.log);

    // Handle different types of errors
    if (error instanceof StatusError) {
      return {
        httpCode: error.status || 400,
        data: {
          error: {
            type: error.type,
            description: error.description
          }
        },
        contentType: 'application/json'
      };
    } else if (error instanceof InfoError) {
      return {
        httpCode: error.status || 400,
        data: {
          error: {
            type: error.type,
            description: error.description
          }
        },
        contentType: 'application/json'
      };
    } else {
      // Handle unexpected errors
      return {
        httpCode: 500,
        data: {
          error: {
            type: 'SERVER_ERROR',
            description:
              process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message
          }
        },
        contentType: 'application/json'
      };
    }
  }

  /**
   * Express-compatible error middleware
   * @param {Error} err Error object
   * @param {Object} req Express request
   * @param {Object} res Express response
   * @param {Function} next Express next function
   */
  static middleware(err, req, res, next) {
    const errorResponse = ErrorHandler.handleError(err);

    res
      .status(errorResponse.httpCode)
      .setHeader('Content-Type', errorResponse.contentType)
      .send(errorResponse.data);
  }

  /**
   * Next-connect compatible error handler
   * @param {Error} err Error object
   * @param {Object} req Request object
   * @param {Object} res Response object
   */
  static ncErrorHandler(err, req, res) {
    const errorResponse = ErrorHandler.handleError(err);

    res
      .status(errorResponse.httpCode)
      .setHeader('Content-Type', errorResponse.contentType)
      .send(errorResponse.data);
  }

  /**
   * Create an error handler for next-connect
   * @returns {Function} Error handler function
   */
  static createNextConnectErrorHandler() {
    return (err, req, res) => ErrorHandler.ncErrorHandler(err, req, res);
  }
}
