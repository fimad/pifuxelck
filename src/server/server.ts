import * as cors from 'cors';
import * as express from 'express';
import { ConnectionConfig } from 'mysql';
import db, { DbConfig } from './middleware/db';
import error from './middleware/error';
import log from './middleware/log';
import mail, { MailConfig } from './middleware/mail';
import models from './middleware/models';
import success from './middleware/success';
import account from './routes/account';
import contacts from './routes/contacts';
import games from './routes/games';
import stats from './routes/stats';

interface Config {
  db: DbConfig;
  mail?: MailConfig;
}

export default function(config: Config) {
  const app = express();
  app.use(cors());
  app.use(express.json({type: '*/*'}));
  app.use(log());
  app.use(models());
  app.use(success());
  app.use(mail(config.mail));
  app.use(db(config.db));
  app.use('/api/2/account', account);
  app.use('/api/2/contacts', contacts);
  app.use('/api/2/games', games);
  app.use('/stats', stats);
  app.use(error());
  return app;
}
