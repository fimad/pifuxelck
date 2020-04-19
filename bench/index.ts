import * as fs from 'fs';

import * as winston from 'winston';

import { benchmark } from './lib';
import loginSuite from './suites/login';

winston.add(
  new winston.transports.Stream({
    stream: fs.createWriteStream('/dev/null'),
  })
);

benchmark(loginSuite);
