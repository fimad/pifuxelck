require('@google-cloud/trace-agent').start();
require('@google-cloud/debug-agent').start();

import { LoggingWinston } from '@google-cloud/logging-winston';
import * as functions from 'firebase-functions';
import * as winston from 'winston';

import config from '../../config/prod';
import server from './server';

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console(), new LoggingWinston()],
});

exports.app = functions.https.onRequest(server(config));
