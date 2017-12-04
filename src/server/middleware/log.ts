import { NextFunction, Request, Response } from 'express';

const log = () => (req: Request, res: Response, next: NextFunction) => {
  req.context = {
    httpRequest: {
      remoteIp: req.connection.remoteAddress,
      requestMethod: req.method,
      requestSize: req.headers['content-length'],
      requestUrl: req.url,
    },
  };
  next();
};

export default log;
