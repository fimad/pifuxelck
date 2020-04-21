import * as express from 'express';
import * as winston from 'winston';

import { newAuthToken } from '../models/auth';
import { getContacts, getSuggestedContacts } from '../models/contacts';
import {
  completedGameSummaries,
  completedGames,
  createGame,
  gameById,
  reapExpiredTurns,
  updateGameCompletedAtTime,
} from '../models/game';
import {
  getInboxEntriesForUser,
  getInboxEntryByGameId,
  updateDrawingTurn,
  updateLabelTurn,
} from '../models/turn';
import { getUserById } from '../models/user';
import authRoute from './auth-route';

const everything = express.Router();

everything.get(
  '/',
  authRoute(async (userId, req, res) => {
    winston.info(`Attempting to lookup all user data`, req.context);

    const [
      user,
      contacts,
      suggestedContacts,
      summaries,
      inbox,
    ] = await Promise.all([
      getUserById(req.db, userId),
      getContacts(req.db, userId),
      getSuggestedContacts(req.db, userId),
      completedGameSummaries(req.db, userId),
      getInboxEntriesForUser(req.db, userId),
    ]);
    winston.info(`Successfully looked up all data for ${userId}.`, req.context);

    res.success({
      user,
      contacts,
      suggested_contacts: suggestedContacts,
      game_summaries: summaries,
      inbox_entries: inbox,
    });
  })
);

export default everything;
