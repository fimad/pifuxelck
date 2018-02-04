import { Connection } from 'mysql';
import * as shuffle from 'shuffle-array';
import * as winston from 'winston';
import { Game, GameSummary, NewGame } from '../../common/models/game';
import { Turn } from '../../common/models/turn';
import { query, transact } from '../db-promise';
import { SendMail } from '../middleware/mail';
import { sendEmailUpdatesAfterTurn } from './turn';

/*

func (e NewGameError) Error() string {
  return common.ModelErrorHelper(e)
}

*/

/**
 * Creates a new game where the first turn is a label submitted by the given
 * user ID, and the remaining turns are alternating drawing and labels with the
 * players corresponding to the entries in the NewGame struct.
 */
export async function createGame(
    db: Connection,
    sendMail: SendMail,
    userId: string,
    newGame: NewGame): Promise<void> {
  const label = (newGame.label || '').trim();
  if (label === '') {
    winston.info('Failed to create game due to lack of label.');
    throw new Error('A label is required to start a game.');
  }

  if (newGame.players && newGame.players.length <= 0) {
    winston.info('Failed to create game due to lack of players.');
    throw new Error('At least one other player is required.');
  }

  await transact(db, async () => {
    //  genericError := []string{'Unable to create a new game at this time.'}
    //  var errors *Errors

    const results = await query(
        db,
        `INSERT INTO Games (
           completed_at_id,
           next_expiration,
           created_at
         )
         VALUES (NULL, NOW() + INTERVAL 2 DAY, NOW())`);
    const gameId = results.insertId;

    // Insert the first turn into the database. This turn will correspond to the
    // label in the new game request and will be logged as being performed by
    // the user that is creating the game.
    await query(
        db,
        `INSERT INTO Turns
         ( account_id
         , game_id
         , is_complete
         , is_drawing
         , label
         , drawing
         ) VALUES (?, ?, 1, 0, ?, '')`,
        [userId, gameId, label]);
    await query(
      db,
      `UPDATE Accounts
       SET game_count = game_count + 1
       WHERE id = ?`,
      [userId]);

    // Create a turn entry for each player (in a random order) in the Players
    // list of newGame, alternating drawing and label turns.
    const players = newGame.players.slice();
    shuffle(players);
    for (let i = 0; i < players.length; i++) {
      const isDrawing = i % 2 === 0;  // Alternate drawing.
      await query(
          db,
          `INSERT INTO Turns
           ( account_id
           , game_id
           , is_complete
           , is_drawing
           , label
           , drawing
           ) VALUES (?, ?, 0, ?, '', '')`,
          [players[i], gameId, isDrawing]);
      await query(
        db,
        `UPDATE Accounts
         SET game_count = game_count + 1
         WHERE id = ?`,
        [players[i]]);
    }
  });
  await sendEmailUpdatesAfterTurn(db, sendMail);
}

/**
 * Takes a game ID and updates the completion time if the game is over, and does
 * nothing otherwise.
 */
export async function updateGameCompletedAtTime(
    db: Connection,
    sendMail: SendMail,
    gameId: string): Promise<void> {
  return transact(db, async () => {
    return updateGameCompletedAtTimeInTransaction(db, sendMail, gameId);
  });
}

// Same as updateGameCompletedAtTime except that it assumes that the caller is
// already running inside a MySQL transaction.
async function updateGameCompletedAtTimeInTransaction(
    db: Connection,
    sendMail: (SendMail | null),
    gameId: string): Promise<void> {
  winston.info(`Checking if game ${gameId} needs a completed at id.`);
  // This query is a conditional insert that will create an entry in the
  // GamesCompletedAt table if and only if the game with id gameId is complete
  // AND there is not already an entry in GamesCompletedAt for this game.
  const results = await query(
      db,
      `INSERT INTO GamesCompletedAt (completed_at)
       (
          SELECT NOW()
          FROM Games
          WHERE (
              SELECT completed_at_id
              FROM Games
              WHERE id = ?) IS NULL
            AND 1 = (
                 SELECT SUM(is_complete) = COUNT(*)
                 FROM Turns
                 WHERE game_id = ?)
          LIMIT 1
       )`,
      [gameId, gameId]);

  // If there is not last inserted ID, then the game was not over. This is
  // fine, just return nil as a success.
  const completedAtId = results.insertId;
  if (completedAtId === null || results.affectedRows === 0) {
    winston.info(`Did not insert completed at ID.`);
    return;
  }

  winston.info(`Did insert completed at ID??? ${completedAtId}.`);

  // If there IS a completed at id, then update the game to point to this new
  // entry.
  await query(
      db,
      'UPDATE Games SET completed_at_id = ? WHERE id = ?',
      [completedAtId, gameId]);

  winston.info(`Marked ${gameId} as finished.`);

  if (sendMail) {
    await sendEmailUpdatesAfterTurn(db, sendMail);
  }
}

/**
 * Removes turns from games where the expiration time has passed. This method
 * should be called periodically to ensure that games to not hang on players who
 * have uninstalled the app or otherwise stopped playing.
 */
export async function reapExpiredTurns(
    db: Connection, sendMail: SendMail): Promise<void> {
  winston.info('Reaping expired turns.');
  await transact(db, async () => {
    // First delete turns from games where the expiration time is in the past.
    await query(
        db,
        `DELETE Turns FROM Turns
         INNER JOIN (
            SELECT
                game_id,
                MIN(id) as next_id
            FROM Turns
            WHERE is_complete = 0
            GROUP BY game_id
         ) AS NextTurn ON NextTurn.next_id = Turns.id
         INNER JOIN (
            SELECT id FROM Games
            WHERE next_expiration < NOW()
         ) AS Games ON Games.id = Turns.game_id
         WHERE Turns.id = NextTurn.next_id`);

    // Next, update the remaining turns
    await query(
        db,
        `UPDATE Turns
         INNER JOIN (
            SELECT id FROM Games
            WHERE next_expiration < NOW() AND completed_at_id IS NULL
         ) AS Games ON Games.id = Turns.game_id
         SET is_drawing = NOT is_drawing
         WHERE is_complete = 0`);

    // Next, bump the expiration time for games that just had a turn reaped.
    await query(
        db,
        `UPDATE Games
         SET next_expiration = NOW() + INTERVAL 2 DAY
         WHERE next_expiration < NOW() AND completed_at_id IS NULL`);

    // Obtain a list of all games where all of the turns are marked as complete,
    // but where the game does not have a completed at ID.
    const results = await query(
        db,
        `SELECT Games.id AS id
         FROM Games AS Games
         INNER JOIN (
            SELECT game_id, COUNT(*) as total
            FROM Turns
            GROUP BY game_id
         ) AS AllTurns ON AllTurns.game_id = Games.id
         INNER JOIN (
            SELECT game_id, COUNT(*) as total
            FROM Turns
            WHERE is_complete = 1
            GROUP BY game_id
         ) AS CompleteTurns ON CompleteTurns.game_id = Games.id
         WHERE Games.completed_at_id IS NULL
           AND CompleteTurns.total = AllTurns.total`);

    for (let i = 0; i < results.length; i++) {
      const gameId = results[i].id;
      winston.info(`Assigning a completed at ID to game ${gameId}.`);
      await updateGameCompletedAtTimeInTransaction(db, null, gameId);
    }

    // TODO(will): Uncomment this once the database is free of all orphaned
    // games.
    //
    // If the number of updated games does not equal the number of expired
    // turns, then fail the transaction.
    //    if updatedGames !== expiredTurns {
    //      log.Warnf(
    //        'Reaping failed,
    //        number of games (%v) and turns (%v) affected differs.',
    //        updatedGames, expiredTurns)
    //      return errors.New(
    //      'Inconsistent number of turns and games affected.')
    //    }
  });
  await sendEmailUpdatesAfterTurn(db, sendMail);
}

async function rowsToGames(rows: any): Promise<Game[]> {
  const gameIdToGame = {} as {[id: string]: Game};
  for (let i = 0; i < rows.length; i++) {
    const gameId = rows[i].game_id;
    const completedAt = rows[i].completed_at;
    const completedAtId = rows[i].completed_at_id;
    const drawingJson = rows[i].drawing;
    const turn = {
      is_drawing: !!rows[i].is_drawing,
      label: rows[i].label,
      player: rows[i].display_name,
    } as Turn;

    // Only attempt to unmarshal the drawing if it is a drawing turn. Otherwise
    // the drawing will be an empty string which is not valid JSON.
    if (turn.is_drawing) {
      try {
        turn.drawing = JSON.parse(drawingJson);
      } catch (error) {
        winston.warn(`Unable to unmarshal drawing, ${error}`);
        winston.debug(`Offending drawing: ${drawingJson}`);
      }
    }

    let game = gameIdToGame[gameId];
    if (game === undefined) {
      game = {
        completed_at: completedAt,
        completed_at_id: completedAtId,
        id: gameId,
        turns: [],
      };
      gameIdToGame[gameId] = game;
    }
    game.turns.push(turn);
  }
  return Object.keys(gameIdToGame).map((x) => gameIdToGame[x]);
}

/** Returns a game given its ID. */
export async function gameById(
    db: Connection,
    userId: string,
    gameId: string): Promise<Game> {
  const results = await query(
      db,
      `SELECT
          Games.id AS game_id,
          Games.completed_at_id AS completed_at_id,
          UNIX_TIMESTAMP(GamesCompletedAt.completed_at) AS completed_at,
          Accounts.display_name AS display_name,
          Turns.is_drawing AS is_drawing,
          Turns.drawing AS drawing,
          Turns.label AS label
       From Turns as Turns
       INNER JOIN (
          SELECT id, completed_at_id
          FROM Games as Games
          INNER JOIN (
              SELECT game_id FROM Turns AS T WHERE T.account_id = ?
          ) AS T ON T.game_id = Games.id
          WHERE Games.completed_at_id IS NOT NULL AND Games.id = ?
       ) AS Games ON Turns.game_id = Games.id
       INNER JOIN (
          SELECT id, display_name
          FROM Accounts as Accounts
       ) AS Accounts ON Turns.account_id = Accounts.id
       INNER JOIN (
          SELECT id, completed_at FROM GamesCompletedAt as GamesCompletedAt
       ) AS GamesCompletedAt ON GamesCompletedAt.id = Games.completed_at_id
       GROUP BY Turns.id
       ORDER BY Games.id ASC, Turns.id ASC`,
      [userId, gameId]);

  const [game] = await rowsToGames(results);
  if (!game) {
    throw new Error('No such game');
  }
  return game;
}

/**
 * Returns a list of games that a given user has participated in and that have
 * been completed since the given completed at ID.
 */
export async function completedGames(
    db: Connection,
    userId: string,
    sinceId: string): Promise<Game[]> {
  const results = await query(
      db,
      `SELECT
          Games.id AS game_id,
          Games.completed_at_id AS completed_at_id,
          UNIX_TIMESTAMP(GamesCompletedAt.completed_at) AS completed_at,
          Accounts.display_name AS display_name,
          Turns.is_drawing AS is_drawing,
          Turns.drawing AS drawing,
          Turns.label AS label
       From Turns as Turns
       INNER JOIN (
          SELECT id, completed_at_id
          FROM Games as Games
          INNER JOIN (
              SELECT game_id FROM Turns AS T WHERE T.account_id = ?
          ) AS T ON T.game_id = Games.id
          WHERE Games.completed_at_id > COALESCE((
            SELECT completed_at_id
            FROM Games
            WHERE id = ?
          ), -1)
          ORDER BY completed_at_id ASC
          LIMIT 25
       ) AS Games ON Turns.game_id = Games.id
       INNER JOIN (
          SELECT id, display_name
          FROM Accounts as Accounts
       ) AS Accounts ON Turns.account_id = Accounts.id
       INNER JOIN (
          SELECT id, completed_at FROM GamesCompletedAt as GamesCompletedAt
       ) AS GamesCompletedAt ON GamesCompletedAt.id = Games.completed_at_id
       GROUP BY Turns.id
       ORDER BY Games.id ASC, Turns.id ASC`,
      [userId, sinceId]);
  return rowsToGames(results);
}

/**
 * Returns a list of games that a given user has participated in and that have
 * been completed since the given completed at ID.
 */
export async function completedGameSummaries(
    db: Connection,
    userId: string): Promise<GameSummary[]> {
  const rows = await query(
      db,
      `
      SELECT
        History.id AS id,
        History.completed_at_id AS completed_at_id,
        History.completed_at AS completed_at,
        History.players AS players,
        LabelTurn.label AS first_label,
        SUBSTRING(
          DrawingTurn.drawing,
          LOCATE("background_color", DrawingTurn.drawing) + 18,
          LOCATE(
            "}",
            DrawingTurn.drawing,
            LOCATE("background_color", DrawingTurn.drawing)) - 20
        ) AS background_color
      FROM (
        SELECT
          Games.id AS id,
          Games.completed_at_id AS completed_at_id,
          UNIX_TIMESTAMP(GamesCompletedAt.completed_at) AS completed_at,
          GROUP_CONCAT(
            AllPlayerTurns.player
            ORDER BY AllPlayerTurns.id ASC
            SEPARATOR ", ") AS players,
          MIN(LabelTurns.id) AS label_id,
          MIN(DrawingTurns.id) AS drawing_id
        FROM Games
        INNER JOIN GamesCompletedAt
        ON GamesCompletedAt.id = Games.completed_at_id
        INNER JOIN (
          SELECT game_id
          FROM Turns AS T
          WHERE T.account_id = ?
        ) AS UserGames ON UserGames.game_id = Games.id
        INNER JOIN (
          SELECT id, label, game_id
          FROM Turns
          WHERE NOT is_drawing
        ) AS LabelTurns ON LabelTurns.game_id = Games.id
        INNER JOIN (
          SELECT id, label, game_id
          FROM Turns
          WHERE is_drawing
        ) AS DrawingTurns ON DrawingTurns.game_id = Games.id
        INNER JOIN (
          SELECT
            Turns.id AS id,
            game_id,
            Accounts.display_name AS player
          FROM Turns
          INNER JOIN Accounts ON Turns.account_id = Accounts.id
        ) AS AllPlayerTurns ON AllPlayerTurns.game_id = Games.id
        GROUP BY 1, 2, 3
      ) AS History
      INNER JOIN Turns AS LabelTurn ON LabelTurn.id = label_id
      INNER JOIN Turns AS DrawingTurn ON DrawingTurn.id = drawing_id
      ORDER BY completed_at_id ASC
      `,
      [userId]);

  const summaries = [];
  for (let i = 0; i < rows.length; i++) {
    const backgroundColorJson = rows[i].background_color;
    const {
      completed_at,
      completed_at_id,
      first_label,
      id,
      players,
    } = rows[i] as GameSummary;

    let backgroundColor;
    try {
      backgroundColor = JSON.parse(backgroundColorJson);
    } catch (error) {
      winston.warn(`Unable to unmarshal background color, ${error}`);
      winston.warn(`Offending drawing: ${backgroundColorJson}`);
      continue;
    }

    summaries.push({
      background_color: backgroundColor,
      completed_at,
      completed_at_id,
      first_label,
      id,
      players,
    });
  }
  return summaries;
}
