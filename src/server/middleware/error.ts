import * as winston from 'winston';
import ServerError from '../error';
import { Message } from '../../common/models/message';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that handles thrown exceptions and translates them into an error
 * message response.
 */
const error = () => (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction) => {
  winston.error(error.stack, req.context);
  let errors = (error as ServerError).errors || {
    application: [error.message],
  };
  res.status(500).send({errors} as Message).end();
};

export default error;
