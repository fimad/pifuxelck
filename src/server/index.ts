import * as winston from 'winston';
import config from '../../config/prod';
import server from './server';

const LoggingWinston: any = require('@google-cloud/logging-winston');
const functions: any = require('firebase-functions');
require('@google-cloud/trace-agent').start();

winston.add(LoggingWinston);

exports.app = functions.https.onRequest(server(config));
