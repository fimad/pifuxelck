import { NextFunction, Request, Response } from 'express';
import * as winston from 'winston';
import { Message } from '../../common/models/message';
import ServerError from '../error';

/**
 * Middleware that handles thrown exceptions and translates them into an error
 * message response.
 */
const error = () => (
    throwError: Error,
    req: Request,
    res: Response,
    next: NextFunction) => {
  winston.error(throwError.stack, req.context);
  const errors = (throwError as ServerError).errors || {
    application: [throwError.message],
  };
  res.status(500).send({errors} as Message).end();
};

export default error;
