import { Connection } from 'mysql';
import * as winston from 'winston';
import { Drawing } from '../../common/models/drawing';
import { InboxEntry, Turn } from '../../common/models/turn';
import { query, transact } from '../db-promise';
import { SendMail } from '../middleware/mail';

async function rowToInboxEntry(row: any): Promise<InboxEntry> {
  const drawingJson = row.drawing;
  const entry = {
    expiration_time: row.expiration_time,
    game_id: row.game_id,
    previous_turn: {
      is_drawing: !!row.is_drawing,
      label: row.label,
    },
  } as InboxEntry;

  // Only attempt to unmarshal the drawing if it is a drawing turn.
  // Otherwise the drawing will be an empty string which is not valid JSON.
  if (entry.previous_turn.is_drawing) {
    try {
      entry.previous_turn.drawing = JSON.parse(drawingJson);
    } catch (error) {
      winston.warn(`Unable to unmarshal drawing, ${error}`);
      winston.debug(`Offending drawing: ${drawingJson}`);
      throw error;
    }
  }
  return entry;
}

/** Returns an inbox entry for the given user and game id. */
export async function getInboxEntryByGameId(
    db: Connection,
    userId: string,
    gameId: string): Promise<InboxEntry> {
  winston.info(`Querying for all available inbox entries for ${userId}.`);
  const results = await query(
      db,
      `SELECT
          T.id AS id,
          T.game_id AS game_id,
          T.drawing AS drawing,
          T.label AS label,
          T.is_drawing AS is_drawing,
          UNIX_TIMESTAMP(Games.next_expiration) AS expiration_time
       FROM Turns AS T
       INNER JOIN (
         SELECT MIN(CT.id) AS current_turn_id, CT.game_id
         FROM Turns AS CT
         WHERE is_complete = 0
         GROUP BY CT.game_id
       ) AS CT ON CT.game_id = T.game_id
       INNER JOIN (
         SELECT MIN(UT.id) AS user_turn_id, UT.game_id
         FROM Turns AS UT
         WHERE is_complete = 0
           AND UT.account_id = ?
         GROUP BY UT.game_id
       ) AS UT ON UT.game_id = T.game_id
       INNER JOIN (
         SELECT MAX(PT.id) as previous_turn_id, PT.game_id
         FROM Turns AS PT
         WHERE is_complete = 1
         GROUP BY PT.game_id
       ) AS PT ON PT.previous_turn_id = T.id
       INNER JOIN Games ON T.game_id = Games.id
       WHERE CT.game_id = ? AND CT.current_turn_id = UT.user_turn_id`,
      [userId, gameId]);
  if (results.length < 1) {
    throw new Error('No entry for that ID.');
  }
  return rowToInboxEntry(results[0]);
}

/*
 * Returns a list of all inbox entries that are currently open for a given
 * player. These inbox entries represent all the turns that the user can
 * currently take.
 */
export async function getInboxEntriesForUser(
    db: Connection,
    userId: string): Promise<InboxEntry[]> {
  winston.info(`Querying for all available inbox entries for ${userId}.`);
  const results = await query(
      db,
      `SELECT
          T.id AS id,
          T.game_id AS game_id,
          T.drawing AS drawing,
          T.label AS label,
          T.is_drawing AS is_drawing,
          UNIX_TIMESTAMP(Games.next_expiration) AS expiration_time
       FROM Turns AS T
       INNER JOIN (
         SELECT MIN(CT.id) AS current_turn_id, CT.game_id
         FROM Turns AS CT
         WHERE is_complete = 0
         GROUP BY CT.game_id
       ) AS CT ON CT.game_id = T.game_id
       INNER JOIN (
         SELECT MIN(UT.id) AS user_turn_id, UT.game_id
         FROM Turns AS UT
         WHERE is_complete = 0
           AND UT.account_id = ?
         GROUP BY UT.game_id
       ) AS UT ON UT.game_id = T.game_id
       INNER JOIN (
         SELECT MAX(PT.id) as previous_turn_id, PT.game_id
         FROM Turns AS PT
         WHERE is_complete = 1
         GROUP BY PT.game_id
       ) AS PT ON PT.previous_turn_id = T.id
       INNER JOIN Games ON T.game_id = Games.id
       WHERE CT.current_turn_id = UT.user_turn_id`,
      [userId]);
  const entries = [];
  for (let i = 0; i < results.length; i++) {
    entries.push(await rowToInboxEntry(results[i]));
  }
  return entries;
}

/**
 * Updates the users turn in a given game with a label. This will fail if the
 * user is not the next player, or if the next turn is not a label turn.
 */
export async function updateDrawingTurn(
    db: Connection,
    sendMail: SendMail,
    userId: string,
    gameId: string,
    drawing: Drawing): Promise<void> {
  winston.info(`User ${userId} updating drawing in game ${gameId}.`);
  const drawingJson = JSON.stringify(drawing);

  const results = await query(
      db,
      `UPDATE Turns, Games
       SET
          drawing = ?,
          is_complete = 1,
          completed_at = NOW(),
          Games.next_expiration = NOW() + INTERVAL 2 DAY
       WHERE Turns.game_id = Games.id
         AND Turns.account_id = ?
         AND Turns.game_id = ?
         AND Turns.is_drawing = 1
         AND Turns.id = (
              SELECT MIN(T.id)
              FROM (SELECT * FROM Turns) AS T
              WHERE T.is_complete = 0 AND T.game_id = ?)`,
      [drawingJson, userId, gameId, gameId]);

  const affectedRows = results.affectedRows;
  if (affectedRows <= 0) {
    winston.info('Drawing turn update failed because no rows were affected.');
    throw new Error('Unable to take a turn at this time.');
  }
  await sendEmailUpdatesAfterTurn(db, sendMail);
}

/**
 * Updates the users turn in a given game with a drawing. This will fail if the
 * user is not the next player, or if the next turn is not a drawing turn.
 */
export async function updateLabelTurn(
    db: Connection,
    sendMail: SendMail,
    userId: string,
    gameId: string,
    rawLabel: string): Promise<void> {
  winston.info(`User ${userId} updating label in game ${gameId}.`);
  const label = rawLabel.trim();
  if (!label || label === '') {
    throw new Error('Labels must not be empty.');
  }
  const results = await query(
      db,
      `UPDATE Turns, Games
       SET
          Turns.label = ?,
          Turns.is_complete = 1,
          completed_at = NOW(),
          Games.next_expiration = NOW() + INTERVAL 2 DAY
       WHERE Turns.game_id = Games.id
         AND Turns.account_id = ?
         AND Turns.game_id = ?
         AND Turns.is_drawing = 0
         AND Turns.id = (
              SELECT MIN(T.id)
              FROM (SELECT * FROM Turns) AS T
              WHERE T.is_complete = 0 AND T.game_id = ?)`,
      [label, userId, gameId, gameId]);

  const affectedRows = results.affectedRows;
  if (affectedRows <= 0) {
    winston.info('Label turn update failed because no rows were affected.');
    throw new Error('Unable to take a turn at this time.');
  }
  await sendEmailUpdatesAfterTurn(db, sendMail);
}

export async function sendEmailUpdatesAfterTurn(
    db: Connection, sendMail: SendMail): Promise<void> {
  await Promise.all([
      sendEmailUpdatesForGameOver(db, sendMail),
      sendEmailUpdatesForNextTurn(db, sendMail),
  ]);
}

export async function sendEmailUpdatesForGameOver(
    db: Connection, sendMail: SendMail): Promise<void> {
  const emailsAndGames = await transact(db, async () => {
    const gamesToNotifyQuery =
        `SELECT
           Turns.game_id AS game_id,
           Accounts.email AS email
         FROM Turns
         INNER JOIN (
           SELECT id, did_notify
           FROM Games
           WHERE completed_at_id IS NOT NULL AND NOT did_notify
         ) AS CompletedGames ON CompletedGames.id = Turns.game_id
         INNER JOIN Accounts ON Accounts.id = Turns.account_id`;
    const queryResults = await query(db, gamesToNotifyQuery, []);
    await query(
        db,
        `UPDATE Games
         SET Games.did_notify = TRUE
         WHERE Games.id IN (
           SELECT X.game_id
           FROM (${gamesToNotifyQuery}) AS X
           GROUP BY 1
         )`, []);
    const results = [];
    for (let i = 0; i < queryResults.length; i++) {
      const game = queryResults[i].game_id;
      const email = queryResults[i].email;
      if (email) {
        results.push({game, email});
      }
    }
    return results;
  });

  await Promise.all(emailsAndGames.map(async ({email, game}) => {
    await sendMail({
      body: finshedGameEmail.replace('%GAMEID%', game),
      subject: 'New completed game!',
      to: email,
    });
  }));
}

export async function sendEmailUpdatesForNextTurn(
    db: Connection, sendMail: SendMail): Promise<void> {
  const emailsAndGames = await transact(db, async () => {
    const turnsToNotifyQuery =
        `SELECT
           Turns.id AS turn_id,
           Turns.game_id AS game_id,
           Accounts.email AS email
         FROM (
           SELECT
             MIN(id) AS id,
             game_id AS game_id
           FROM Turns
           WHERE NOT is_complete
           GROUP BY game_id
         ) AS NT
         INNER JOIN Turns ON NT.id = Turns.id
         INNER JOIN Accounts ON Accounts.id = Turns.account_id
         WHERE NOT did_notify`;
    const queryResults = await query(db, turnsToNotifyQuery, []);
    await query(
        db,
        `UPDATE Turns
         SET Turns.did_notify = TRUE
         WHERE Turns.id IN (
           SELECT X.turn_id
           FROM (${turnsToNotifyQuery}) AS X
         )`, []);
    const results = [];
    for (let i = 0; i < queryResults.length; i++) {
      const game = queryResults[i].game_id;
      const email = queryResults[i].email;
      if (email) {
        results.push({game, email});
      }
    }
    return results;
  });

  await Promise.all(emailsAndGames.map(async ({email, game}) => {
    await sendMail({
      body: yourTurnEmail,
      subject: 'It is your turn!',
      to: email,
    });
  }));
}

const yourTurnEmail = `
<div style="
    margin: 0px;
    display: flex;
    flex-direction: column;
    justify-content: space-between
">

  <div style="
      flex: 0 1 auto;
      font-size: 48px;
      text-align: center;
      background-color: #3f51b5;
      color: white;
      padding: 16px;
  ">
    Its your turn
    <div style="font-size: 18px; margin-top: 6px">
      ❤️ #blessed #lit 🔥
    </div>

    <div style="line-height: 32px; font-size: 24px; margin-top: 32px;">
    Someone has added you to a
    <span style="font-weight: bold">pifuxelck™©®☢</span>
    game. 🎉👏🎂

    <br />

    You have 2 days to take your turn before you are automatically
    skipped.

    <br />

    If you are skipped you will not be able to see the completed game!
    </div>
  </div>

  <div style="
      margin-top: 64px;
      flex: 1 1 auto;
      font-size: 48px;
      text-align: center;
      line-height: 96px;
  ">
    <a
        href="https://everythingissauce.com"
        style="
            text-decoration:none;
            color: black;
        ">
      Play now!
      <br />
      <img
         width="48"
         height="48"
         src="https://everythingissauce.com/images/icon-48.png" />
    </a>
  </div>
<div>
`;

const finshedGameEmail = `
<div style="
    margin: 0px;
    display: flex;
    flex-direction: column;
    justify-content: space-between
">

  <div style="
      flex: 0 1 auto;
      font-size: 48px;
      text-align: center;
      background-color: #3f51b5;
      color: white;
      padding: 16px;
  ">
    New finished game
    <div style="font-size: 18px; margin-top: 6px">
      🙌 #praise 🕊️
    </div>

    <div style="line-height: 32px; font-size: 24px; margin-top: 32px;">
    You just finished a
    <span style="font-weight: bold">pifuxelck™©®☢</span>
    game. 🎉👏🎂

    </div>
  </div>

  <div style="
      margin-top: 64px;
      flex: 1 1 auto;
      font-size: 48px;
      text-align: center;
      line-height: 96px;
  ">
    <a
        href="https://everythingissauce.com/game/%GAMEID%"
        style="
            text-decoration:none;
            color: black;
        ">
      Check it out!
      <br />
      <img
         width="48"
         height="48"
         src="https://everythingissauce.com/images/icon-48.png" />
    </a>
  </div>
<div>
`;
