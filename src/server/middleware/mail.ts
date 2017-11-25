import * as mailgun from 'mailgun-js';
import * as winston from 'winston';
import { Request, Response, NextFunction } from 'express';

const mailcomposer = require('mailcomposer');

export type SendMailParams = {
  to: string,
  subject: string,
  body: string,
};

export type SendMail = (params: SendMailParams) => void;

export type MailConfig = {
  apiKey: string
  domain: string
};

const mailMiddleware = (config?: MailConfig) => {
  let sendMail = (params: SendMailParams) => {};
  if (config) {
    const mail = mailgun(config);
    sendMail = ({to, subject, body}: SendMailParams) => {
      const composer = mailcomposer({
        from: `noreply@${config.domain}`,
        to,
        subject,
        text: subject,
        html: body,
      });
      composer.build((mailBuildError: Error, message: any) => {
        const dataToSend = {to, message: message.toString('ascii')};
        mail.messages().sendMime(dataToSend, function(sendError, body) {
          if (sendError) {
            winston.error(`Unable to send mail ${sendError}`);
          }
        });
      });
    };
  }

  return (req : Request, res : Response, next : NextFunction) => {
    req.sendMail = sendMail;
    next();
  };
}

export default mailMiddleware;
