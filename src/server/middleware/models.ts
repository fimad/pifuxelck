import { NextFunction, Request, Response } from 'express';

import { Message } from '../../common/models/message';

/**
 * Middleware that will connect to a MySQL database with a given configuration,
 * and add the connection to the db fields of the request object.
 */
const models = () => (req: Request, res: Response, next: NextFunction) => {
  req.parseGameMessage = () => Promise.resolve(req.body as Message);
  req.parseTurnMessage = () => Promise.resolve(req.body as Message);
  req.parseUserMessage = () => Promise.resolve(req.body as Message);
  req.parseContactGroupMessage = () => Promise.resolve(req.body as Message);
  next();
};

export default models;
