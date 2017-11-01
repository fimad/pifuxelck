import config from '../config/prod';
import server from './server';

exports.app = server(config);
