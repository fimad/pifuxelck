import * as express from 'express';
import account from './routes/account';
import contacts from './routes/contacts';
import db, { DbConfig } from './middleware/db';
import error from './middleware/error';
import games from './routes/games';
import models from './middleware/models';
import success from './middleware/success';
import { ConnectionConfig } from 'mysql';

type Config = {
  db: DbConfig,
};

export default function(config: Config) {
  const app = express();
  app.use(express.json());
  app.use(models());
  app.use(success());
  app.use(db(config.db));
  app.use('/api/2/account', account);
  app.use('/api/2/contacts', contacts);
  app.use('/api/2/games', games);
  app.use(error());
  return app;
};
