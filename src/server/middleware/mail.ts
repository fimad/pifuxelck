import * as mailgun from 'mailgun-js';
import * as winston from 'winston';
import { Request, Response, NextFunction } from 'express';

const mailcomposer = require('mailcomposer');

export type SendMailParams = {
  to: string,
  subject: string,
  body: string,
};

export type SendMail = (params: SendMailParams) => Promise<void>;

export type MailConfig = ProdMailConfig | TestMailConfig;

type ProdMailConfig = {
  apiKey: string
  domain: string
};

type TestMailConfig = {
  // Allow a custom sendMail method to be injected. Used by tests to intercept
  // mail.
  sendMail: SendMail
};

const mailMiddleware = (config?: MailConfig) => {
  let sendMail = (params: SendMailParams) => Promise.resolve();
  if (config && (<TestMailConfig>config).sendMail) {
    sendMail = (<TestMailConfig>config).sendMail;
  } else if (<ProdMailConfig>config) {
    const mail = mailgun(<ProdMailConfig>config);
    sendMail = ({to, subject, body}: SendMailParams) =>
        new Promise((resolve) => {
      const composer = mailcomposer({
        from: `noreply@${(<ProdMailConfig>config).domain}`,
        to,
        subject,
        text: subject,
        html: body,
      });
      composer.build((buildError: Error, message: any) => {
        if (buildError) {
          winston.error(`Unable to build mail ${buildError}`);
          resolve();
          return;
        }

        const dataToSend = {to, message: message.toString('ascii')};
        mail.messages().sendMime(dataToSend, function(sendError, body) {
          if (sendError) {
            winston.error(`Unable to send mail ${sendError}`);
          }
          resolve();
        });
      });
    });
  }

  return (req : Request, res : Response, next : NextFunction) => {
    req.sendMail = sendMail;
    next();
  };
}

export default mailMiddleware;
