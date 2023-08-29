export class StatusError extends Error {
  constructor(type, description, status) {
    super(`${type}: ${description}`);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StatusError);
    }

    this.type = type;
    this.status = status;
    this.description = description;
  }
}

export class InfoError extends Error {
  constructor(type, description, status) {
    super(type);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InfoError);
    }

    this.type = type;
    this.status = status;
    this.description = description;
  }
}

export default class Errors {
  static critical(description, type = 'CRITICAL') {
    return new StatusError(type, description, 550);
  }
}
