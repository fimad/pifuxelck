import { Router } from 'express';
import * as winston from 'winston';
import asyncRoute from './async-route';
import authRoute from './auth-route';

import {
  getInboxEntriesForUser,
  getInboxEntryByGameId,
  updateDrawingTurn,
  updateLabelTurn,
} from '../models/turn';

import {
  completedGames,
  completedGameSummaries,
  createGame,
  gameById,
  reapExpiredTurns,
  updateGameCompletedAtTime,
} from '../models/game';

const games = Router();

games.get('/', authRoute(async (userId, req, res) => {
  const sinceId = req.query.since || '0';
  winston.info(`Requesting history since ${sinceId}.`, req.context);
  const allGames = await completedGames(req.db, userId, sinceId);
  winston.info(`Looked up history since ${sinceId}.`, req.context);
  res.success({games: allGames});
}));

games.get('/summary', authRoute(async (userId, req, res) => {
  winston.info(`Requesting history summary.`, req.context);
  const allGames = await completedGameSummaries(req.db, userId);
  winston.info(`Looked up history summary.`, req.context);
  res.success({game_summaries: allGames});
}));

games.get('/tick', asyncRoute(async (req, res) => {
  await reapExpiredTurns(req.db, req.sendMail);
  res.success({});
}));

games.get('/:id(\\d+)', authRoute(async (userId, req, res) => {
  const gameId = req.params.id;
  winston.info(`Requesting game ${gameId}.`, req.context);
  const game = await gameById(req.db, userId, gameId);
  winston.info(`Looked up game ${gameId}.`, req.context);
  res.success({game});
}));

games.get('/inbox', authRoute(async (userId, req, res) => {
  winston.info(`Attempting to query inbox.`, req.context);
  const entries = await getInboxEntriesForUser(req.db, userId);
  winston.info(`Retrieved inbox.`, req.context);
  res.success({inbox_entries: entries});
}));

games.get('/inbox/:gameId(\\d+)', authRoute(async (userId, req, res) => {
  const {gameId} = req.params;
  winston.info(
      `Attempting to query users inbox for game ID ${gameId}.`, req.context);
  const entry = await getInboxEntryByGameId(req.db, userId, gameId);
  winston.info(`User retrieved inbox.`, req.context);
  res.success({inbox_entry: entry});
}));

games.post('/new', authRoute(async (userId, req, res) => {
  const newGame = (await req.parseGameMessage()).new_game;
  winston.info(`Attempting to start new game.`, req.context);
  await createGame(req.db, req.sendMail, userId, newGame);
  winston.info(`Created new game.`, req.context);
  res.success({});
}));

games.put('/play/:gameId(\\d+)', authRoute(async (userId, req, res) => {
  const {turn} = await req.parseTurnMessage();
  const {gameId} = req.params;
  winston.info(`Taking turn in game ${gameId}.`, req.context);

  if (turn.is_drawing === true) {
    await updateDrawingTurn(req.db, req.sendMail, userId, gameId, turn.drawing);
  } else {
    await updateLabelTurn(req.db, req.sendMail, userId, gameId, turn.label);
  }

  // Check if the game needs to have it's completed at time updated.
  await updateGameCompletedAtTime(req.db, req.sendMail, gameId);
  winston.info(`Took turn in game ${gameId}.`, req.context);
  res.success({});
}));

export default games;
