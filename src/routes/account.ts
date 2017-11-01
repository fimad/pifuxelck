import * as express from 'express';
import * as winston from 'winston';
import asyncRoute from './async-route';
import { createUser, lookupByPassword } from '../models/user';
import { newAuthToken } from '../models/auth';

const account = express.Router();

account.post('/login', asyncRoute(async (req, res) => {
  const user = await req.parseUserMessage();

  winston.info(`Attempting to look up user ${user.display_name}.`);
  const id = await lookupByPassword(req.db, user);

  winston.info(`Creating new auth token for ${user.display_name}.`);
  const auth = await newAuthToken(req.db, id);

  winston.info(`Successfully logged in as user ${user.display_name}.`);
  res.success({
    meta: {auth},
    user: {id, display_name: user.display_name},
  });
}));

account.post('/register', asyncRoute(async (req, res) => {
  const origUser = await req.parseUserMessage();

  winston.info(`Attempting to register new user ${origUser.display_name}.`);
  const user = await createUser(req.db, origUser);

  winston.info(`Creating new auth token for ${user.display_name}.`);
  const auth = await newAuthToken(req.db, user.id);

  winston.info(
      `Successfully registered new user ${user.display_name} (${user.id}).`);
      res.success({meta: {auth}, user});
}));

account.put('/', asyncRoute(async (req, res) => {
  throw new Error('TODO: Not implemented.');
}));

export default account;
