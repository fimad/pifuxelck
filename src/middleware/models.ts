import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that will connect to a MySQL database with a given configuration,
 * and add the connection to the db fields of the request object.
 */
const models = () => (req : Request, res : Response, next : NextFunction) => {
  req.parseUserMessage = () => Promise.resolve(req.body);
  next();
};

export default models;
