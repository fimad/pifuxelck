import * as winston from 'winston';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that adds the success function to the response object.
 */
const error = () => (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction) => {
  winston.error(error.stack, req.context);
  res.status(500).send(error.stack).end();
};

export default error;

