import * as uuid from 'uuid';
import { Connection } from 'mysql';
import { User } from '../../common/models/user';
import { query } from '../db-promise';

/** Looks up a user given a display name. */
export async function contactLookup(
    db: Connection, name: string): Promise<User> {
  const results = await query(
      db, 'SELECT id FROM Accounts WHERE display_name = ?', [name]);
  if (!results[0]) {
    throw new Error('No such error.');
  }
  const {id} = results[0];
  return {display_name: name, id} as User;
}
