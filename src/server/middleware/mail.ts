import { NextFunction, Request, Response } from 'express';
import * as winston from 'winston';

const mailgun = require('mailgun.js');

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
    const prodConfig = config as ProdMailConfig;
    const mg = mailgun.client({ username: 'api', key: prodConfig.apiKey });
    sendMail = ({ to, subject, body }: SendMailParams) =>
      mg.messages
        .create(prodConfig.domain, {
          from: `noreply@${(config as ProdMailConfig).domain}`,
          html: body,
          subject,
          text: subject,
          to: [to],
        })
        .catch((err: any) => winston.error(`Unable to send email ${err}`));
  }

  return (req: Request, res: Response, next: NextFunction) => {
    req.sendMail = sendMail;
    next();
  };
};

export default mailMiddleware;
