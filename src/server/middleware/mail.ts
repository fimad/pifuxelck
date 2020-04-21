import { NextFunction, Request, Response } from 'express';
import * as mailgun from 'mailgun-js';
import * as winston from 'winston';

const mailcomposer = require('mailcomposer');

export interface SendMailParams {
  to: string;
  subject: string;
  body: string;
}

export type SendMail = (params: SendMailParams) => Promise<void>;

export type MailConfig = ProdMailConfig | TestMailConfig;

interface ProdMailConfig {
  apiKey: string;
  domain: string;
}

interface TestMailConfig {
  // Allow a custom sendMail method to be injected. Used by tests to intercept
  // mail.
  sendMail: SendMail;
}

const mailMiddleware = (config?: MailConfig) => {
  let sendMail = (params: SendMailParams) => Promise.resolve();
  if (config && (config as TestMailConfig).sendMail) {
    sendMail = (config as TestMailConfig).sendMail;
  } else if (config as ProdMailConfig) {
    const mail = mailgun(config as ProdMailConfig);
    sendMail = ({ to, subject, body }: SendMailParams) =>
      new Promise((resolve) => {
        const composer = mailcomposer({
          from: `noreply@${(config as ProdMailConfig).domain}`,
          html: body,
          subject,
          text: subject,
          to,
        });
        composer.build((buildError: Error, message: any) => {
          if (buildError) {
            winston.error(`Unable to build mail ${buildError}`);
            resolve();
            return;
          }

          const dataToSend = { to, html: message.toString('ascii') };
          mail.messages().send(dataToSend, (sendError) => {
            if (sendError) {
              winston.error(`Unable to send mail ${sendError}`);
            }
            resolve();
          });
        });
      });
  }

  return (req: Request, res: Response, next: NextFunction) => {
    req.sendMail = sendMail;
    next();
  };
};

export default mailMiddleware;
