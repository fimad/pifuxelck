import { Errors } from '../common/models/message';

class ServerError extends Error {
  public errors: Errors;

  constructor(errors: Errors) {
    super(JSON.stringify(errors));

    // Maintains proper stack trace for where our error was thrown (only
    // available on V8).
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServerError);
    }

    this.errors = errors;
  }
}

export default ServerError;
