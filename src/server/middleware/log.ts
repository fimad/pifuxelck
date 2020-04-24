import { NextFunction, Request, Response } from 'express';
import * as winston from 'winston';

const log = () => (req: Request, res: Response, next: NextFunction) => {
  req.context = {
    httpRequest: {
      remoteIp: req.connection.remoteAddress,
      requestMethod: req.method,
      requestSize: req.headers['content-length'],
      requestUrl: req.url,
    },
  };
  winston.info(`Incoming request to [${req.method}] ${req.url}`, req.context);
  next();
};

export default log;
