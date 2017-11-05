import * as winston from 'winston';
import authRoute from './auth-route';
import { Router } from 'express';

import {
  getInboxEntriesForUser,
  getInboxEntryByGameId,
  updateDrawingTurn,
  updateLabelTurn,
} from '../models/turn';

import {
  completedGames,
  createGame,
  gameById,
  reapExpiredTurns,
  updateGameCompletedAtTime,
} from '../models/game';

const games = Router();

games.get('/', authRoute(async (userId, req, res) => {
  const sinceId = req.query.since || '0';
  winston.info(`User ${userId} is requesting history since ${sinceId}.`);
  const games = await completedGames(req.db, userId, sinceId);
  winston.info(`User ${userId} looked up history since ${sinceId}.`);
  res.success({games});
}));

games.get('/:id(\\d+)', authRoute(async (userId, req, res) => {
  const gameId = req.params.id;
  winston.info(`User ${userId} is requesting game ${gameId}.`);
  const game = await gameById(req.db, userId, gameId);
  winston.info(`User ${userId} looked up game ${gameId}.`);
  res.success({game});
}));

games.get('/inbox', authRoute(async (userId, req, res) => {
  await reapExpiredTurns(req.db);
  winston.info(`Attempting to query user ${userId} inbox.`);
  const entries = await getInboxEntriesForUser(req.db, userId);
  winston.info(`User ${userId} retrieved inbox.`);
  res.success({inbox_entries: entries});
}));

games.get('/inbox/:gameId(\\d+)', authRoute(async (userId, req, res) => {
  const {gameId} = req.params;
  winston.info(`Attempting to query users inbox for game ID ${gameId}.`);
  const entry = await getInboxEntryByGameId(req.db, userId, gameId);
  winston.info(`User ${userId} retrieved inbox.`);
  res.success({inbox_entry: entry});
}));

games.post('/new', authRoute(async (userId, req, res) => {
  const newGame = (await req.parseGameMessage()).new_game;
  winston.info(`Attempting to start new game.`);
  await createGame(req.db, userId, newGame);
  winston.info(`User ${userId} created new game.`);
  res.success({});
}));

games.put('/play/:gameId(\\d+)', authRoute(async (userId, req, res) => {
  const {turn} = await req.parseTurnMessage();
  const {gameId} = req.params;
  winston.info(`User ${userId} is taking their turn in game ${gameId}.`);

  if (turn.is_drawing) {
    await updateDrawingTurn(req.db, userId, gameId, turn.drawing);
  } else {
    await updateLabelTurn(req.db, userId, gameId, turn.label);
  }

  // Check if the game needs to have it's completed at time updated.
  await updateGameCompletedAtTime(req.db, gameId);
  winston.info(`User ${userId} took their turn in game ${gameId}.`);
  res.success({});
}));

export default games;
