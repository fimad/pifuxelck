import { Errors } from '../common/models/message';

class ServerError extends Error {
  errors: Errors;

  constructor(errors: Errors, ...params: any[]) {
    super(JSON.stringify(errors), ...params);

    // Maintains proper stack trace for where our error was thrown (only
    // available on V8).
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServerError);
    }

    this.errors = errors;
  }
}

export default ServerError;
