import { Router } from 'express';
import { Connection } from 'mysql';
import * as winston from 'winston';
import { query, transact } from '../db-promise';
import asyncRoute from './async-route';

import {
  GameDurationHistogram,
  GameSizeHistogram,
  GamesOverTime,
  GameStats,
  UserStats,
} from '../../common/models/stats';

const stats = Router();

async function getStats<T>(
    db: Connection, sql: string, f: (row: any) => T): Promise<T[]> {
  const results = await query(db, sql);
  const result = [] as T[];
  for (let i = 0; i < results.length; i++) {
    result.push(f(results[i]));
  }
  return result;
}

async function getActiveGames(db: Connection): Promise<GameStats> {
  return (await getStats<GameStats>(
    db,
    `
    SELECT
      SUM(completed_at_id IS NULL) AS pending,
      SUM(completed_at_id IS NOT NULL) AS complete,
      SUM(1) AS total
    FROM Games
    `,
    ({total, pending, complete}) => ({
      complete,
      pending,
      total,
    })))[0];
}

async function getGameSizeHistogram(
    db: Connection): Promise<GameSizeHistogram> {
  return getStats(
    db,
    `
    SELECT
      game_size,
      SUM(1) AS total,
      SUM(is_complete) AS complete,
      SUM(NOT is_complete) AS pending
    FROM (
      SELECT
        game_id,
        Games.completed_at_id IS NOT NULL AS is_complete,
        COUNT(*) AS game_size
      FROM Turns
      INNER JOIN Games ON Turns.game_id = Games.id
      GROUP BY game_id, is_complete
    ) X
    GROUP BY game_size
    ORDER BY game_size ASC
    `,
    ({game_size, complete, pending, total}) => ({
      complete,
      pending,
      size: game_size,
      total,
    }));
}

async function getGameDurationHistogram(
    db: Connection): Promise<GameDurationHistogram> {
  return getStats(
    db,
    `
    SELECT
      CEIL(game_duration_secs / 60 / 60 / 24) AS gameDurationDays,
      COUNT(*) as count
    FROM (
      SELECT
        UNIX_TIMESTAMP(GamesCompletedAt.completed_at) -
        UNIX_TIMESTAMP(Games.created_at) AS game_duration_secs
      FROM Games
      INNER JOIN GamesCompletedAt
      ON Games.completed_at_id = GamesCompletedAt.id
    ) X
    WHERE game_duration_secs > 0
    GROUP BY 1
    ORDER BY 1 ASC;
    `,
    ({gameDurationDays, count}) => ({gameDurationDays, count}));
}

async function getUserStats(db: Connection): Promise<UserStats> {
  return getStats(
    db,
    `
    SELECT
      display_name,
      SUM(NOT is_complete) AS pending_games,
      SUM(is_next_player) AS inbox_size,
      SUM(is_first_player) AS started_games,
      SUM(is_complete AND is_drawing) AS drawings,
      SUM(is_complete AND NOT is_drawing) AS labels
    FROM Accounts
    INNER JOIN (
      SELECT
        account_id,
        is_complete,
        is_drawing,
        Turns.id = X.min_id AS is_first_player,
        COALESCE(Turns.id = Y.min_pending_id, FALSE) AS is_next_player
      FROM Turns
      INNER JOIN (
        SELECT
          game_id,
          MIN(id) AS min_id
        FROM Turns
        GROUP BY 1
      ) X ON Turns.game_id = X.game_id
      LEFT JOIN (
        SELECT
          game_id,
          MIN(id) AS min_pending_id
        FROM Turns
        WHERE NOT is_complete
        GROUP BY 1
      ) Y ON Turns.game_id = Y.game_id
    ) InitialTurns ON Accounts.id = InitialTurns.account_id
    GROUP BY 1;
    `,
    (row) => ({
      displayName: row.display_name,
      drawings: row.drawings,
      inboxSize: row.inbox_size,
      labels: row.labels,
      pendingGames: row.pending_games,
      startedGames: row.started_games,
    }));
}

async function getGamesOverTime(db: Connection): Promise<GamesOverTime> {
  return getStats(
    db,
    `
    SELECT
      UNIX_TIMESTAMP(timestamp) AS timestamp,
      SUM(created_at <= timestamp
          AND (timestamp < completed_at
              OR completed_at IS NULL)) AS pendingGames
    FROM (
      SELECT timestamp AS timestamp
      FROM (
        SELECT
          completed_at AS timestamp
        FROM GamesCompletedAt
        UNION ALL (
          SELECT created_at AS timestamp
          FROM Games
        )
      ) X
      -- The date game creation time started being logged.
      WHERE '2017-12-15 22:01:33' < timestamp
      GROUP BY 1
    ) Timestamps
    CROSS JOIN (
      SELECT
        Games.created_at AS created_at,
        GamesCompletedAt.completed_at AS completed_at
      FROM Games
      LEFT JOIN GamesCompletedAt
      ON Games.completed_at_id = GamesCompletedAt.id
    ) GameTimes
    GROUP BY timestamp
    ORDER BY timestamp ASC
    `,
    ({timestamp, pendingGames}) => ({timestamp, pendingGames}));
}

stats.get('/', asyncRoute(async (req, res) => {
  const allStats = {
    gameDurations: await getGameDurationHistogram(req.db),
    gameSizes: await getGameSizeHistogram(req.db),
    gameStats: await getActiveGames(req.db),
    gamesOverTime: await getGamesOverTime(req.db),
    userStats: await getUserStats(req.db),
  };
  res.status(200).type('text/html').send(
    `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="
        width=device-width,
        initial-scale=1.0,
        maximum-scale=1.0,
        user-scalable=no" />
    <title>Pifuxelck Stats</title>
  </head>
  <body style="background: #CFD8DC">
    <div style="
        width: 100%;
        height: 100%;
        top: 0px;
        left: 0px;
        position: absolute;" id="content">
    </div>
    <script src="http://localhost:3000/bundle.js"></script>
    <script>startStats(${JSON.stringify(allStats)});</script>
  </body>
</html>
    `,
  );
}));
export default stats;
