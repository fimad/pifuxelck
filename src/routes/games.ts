import authRoute from './auth-route';
import { Router } from 'express';
import { contactLookup } from '../models/contacts';

const games = Router();

games.get('/', authRoute(async (userId, req, res) => {
  throw new Error('TODO implement');
}));

games.get('/:id(\\d+)', authRoute(async (userId, req, res) => {
  throw new Error('TODO implement');
}));

games.get('/inbox', authRoute(async (userId, req, res) => {
  throw new Error('TODO implement');
}));

games.get('/inbox/:id(\\d+)', authRoute(async (userId, req, res) => {
  throw new Error('TODO implement');
}));

games.post('/new', authRoute(async (userId, req, res) => {
  throw new Error('TODO implement');
}));

games.put('/play/:id(\\d+)', authRoute(async (userId, req, res) => {
  throw new Error('TODO implement');
}));

export default games;
