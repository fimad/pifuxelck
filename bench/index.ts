import * as fs from 'fs';

import { agent } from 'supertest';
import * as winston from 'winston';

import newServer from '../test/server/fake-server';
import { newUser } from '../test/server/fake-user';
import { measure, suite } from './lib';

winston.add(
  new winston.transports.Stream({
    stream: fs.createWriteStream('/dev/null'),
  })
);

suite(
  'Server Benchmarks',

  measure('Add User', async () => {
    const app = agent(await newServer());
    return async () => {
      await newUser(app, 'user');
    };
  }),

  measure('Add User', async () => {
    const app = agent(await newServer());
    return async () => {
      await newUser(app, 'user');
    };
  })
);
