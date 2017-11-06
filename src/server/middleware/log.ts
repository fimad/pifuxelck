import { Request, Response, NextFunction } from 'express';

const log = () => (req : Request, res : Response, next : NextFunction) => {
  req.context = {
    httpRequest: {
      requestUrl: req.url,
      requestMethod: req.method,
      remoteIp: req.connection.remoteAddress,
      requestSize: req.headers['content-length'],
    },
  };
  next();
};

export default log;
