import * as express from 'express';
import * as winston from 'winston';
import asyncRoute from './async-route';
import authRoute from './auth-route';
import { createUser, lookupByPassword, updateUser } from '../models/user';
import { newAuthToken } from '../models/auth';

const account = express.Router();

account.post('/login', asyncRoute(async (req, res) => {
  const {user} = await req.parseUserMessage();

  winston.info(
      `Attempting to look up user ${user.display_name}.`, req.context);
  const id = await lookupByPassword(req.db, user);

  winston.info(
      `Creating new auth token for ${user.display_name}.`, req.context);
  const auth = await newAuthToken(req.db, id);

  winston.info(
      `Successfully logged in as user ${user.display_name}.`, req.context);
  res.success({
    meta: {auth},
    user: {id, display_name: user.display_name},
  });
}));

account.post('/register', asyncRoute(async (req, res) => {
  const {user: origUser} = await req.parseUserMessage();

  winston.info(
      `Attempting to register new user ${origUser.display_name}.`, req.context);
  const user = await createUser(req.db, origUser);

  winston.info(
      `Creating new auth token for ${user.display_name}.`, req.context);
  const auth = await newAuthToken(req.db, user.id);

  winston.info(
      `Successfully registered new user ${user.display_name} (${user.id}).`,
       req.context);
      res.success({meta: {auth}, user});
}));

account.put('/', authRoute(async (userId, req, res) => {
  let {user} = await req.parseUserMessage();
  winston.info(
      `Attempting to update password for ${userId}.`, req.context);

  // Override any ID given in the JSON request body with the actual
  // authenticated user ID.
  user.id = userId;
  user = await updateUser(req.db, user);

  winston.info(
      `Successfully updated password of ${userId}.`, req.context);
  res.success({user});
}));

export default account;
