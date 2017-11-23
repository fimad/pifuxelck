import * as winston from 'winston';
import ServerError from '../error';
import { Connection } from 'mysql';
import { User, UserError } from '../../common/models/user';
import { genSalt, hash, compare } from 'bcrypt';
import { query } from '../db-promise';

async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) {
    return Promise.reject(new Error('Password must be at least 8 characters.'));
  }
  return genSalt().then((salt) => hash(password, salt));
}

/**
 * Takes a User object and attempts to create a new user with the given
 * credentials. This call can fail if the display name is already registered, or
 * if the password is not sufficiently complex.
 */
export async function createUser(db: Connection, user: User): Promise<User> {
  if (!user.display_name || user.display_name == '') {
    return Promise.reject(new Error('Username must be non-empty.'));
  }
  const hash = await hashPassword(user.password);

  winston.info(`Request to register the new user ${user.display_name}.`);
  const res = await query(
      db, 'INSERT INTO Accounts (display_name, password_hash) VALUES (?, ?)',
      [user.display_name, hash])
      .catch(error => new Error('Display name already taken'));

  return {
    display_name: user.display_name,
    id: res.insertId,
  };
}

/**
 * Takes a User object, and returns the ID of the user with the matching display
 * name and password.
 */
export async function lookupByPassword(
    db: Connection, user: User): Promise<string> {
  winston.info(`Retrieving password hash for user ${user.display_name}.`);
  const results = await query(
      db, 'SELECT id, password_hash FROM Accounts WHERE display_name = ?',
      [user.display_name]);

  if (!results[0]) {
    winston.warn('Lookup failed for user.');
    throw new ServerError({auth: 'Invalid user or password.'});
  }

  const valid = await compare(user.password, results[0]['password_hash'].toString());

  if (!valid) {
    winston.warn('Lookup failed, bad password.');
    throw new ServerError({auth: 'Invalid user or password.'});
  }

  winston.info('Lookup success!');
  return results[0]['id'];
}

/** Takes a User object and updates their password. */
export async function setPassword(db: Connection, user: User): Promise<User> {
  const hash = await hashPassword(user.password);
  winston.info(`Updating password in db of user ${user.display_name}.`);
  await query(
      db, 'UPDATE Accounts SET password_hash = ? WHERE id = ?',
      [hash, user.id]);
  user.password = '';
  return user;
}
