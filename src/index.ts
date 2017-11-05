import * as winston from 'winston';
import config from '../config/prod';
import server from './server';

const LoggingWinston = require('@google-cloud/logging-winston');
const functions = require('firebase-functions');

winston.add(LoggingWinston);

exports.app = functions.https.onRequest(server(config));
