import { Connection } from 'mysql';
import * as uuid from 'uuid';
import * as winston from 'winston';
import { query } from '../db-promise';
import ServerError from '../error';

/**
 * Creates a new authentication token for the given user ID.  Presenting this
 * token in the x-pifuxelck-auth header will authenticate the request as coming
 * from the user with the given id.
 */
export async function newAuthToken(
  db: Connection,
  userId: string
): Promise<string> {
  await pruneAuthTokens(db);
  winston.info(`Generating new random token for user with ID ${userId}.`);
  const auth = uuid.v4();
  await query(
    db,
    `INSERT INTO Sessions (auth_token, account_id, created_at, accessed_at)
       VALUES (?, ?, NOW(), NOW())`,
    [auth, userId]
  );
  return auth;
}

/**
 *
 * Takes an authentication token an returns the user ID that corresponds to the
 * given token.
 */
export async function authTokenLookup(
  db: Connection,
  auth: string
): Promise<string> {
  await pruneAuthTokens(db);
  const results = await query(
    db,
    'SELECT account_id AS id FROM Sessions WHERE auth_token = ?',
    [auth]
  );
  if (!results[0]) {
    throw new ServerError({ auth: 'Invalid authentication token' });
  }
  await query(
    db,
    'UPDATE Sessions SET accessed_at = NOW() WHERE auth_token = ?',
    [auth]
  );
  return results[0].id;
}

/** Prune all existing authentication tokens that are older than 7 days. */
async function pruneAuthTokens(db: Connection): Promise<any> {
  winston.info('Pruning all expired authentication tokens.');
  await query(
    db,
    'DELETE FROM Sessions WHERE accessed_at < NOW() - INTERVAL 7 DAY'
  );
}
