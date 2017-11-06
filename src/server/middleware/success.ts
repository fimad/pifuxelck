import * as winston from 'winston';
import { Message } from '../../common/models/message';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that adds the success function to the response object.
 */
const success = () => (req : Request, res : Response, next : NextFunction) => {
  res.success = (response: Message) => {
    winston.info('Successful request.', req.context);
    res.status(200).type('application/json').send(response || {}).end();
  };
  next();
};

export default success;
