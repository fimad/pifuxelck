import * as uuid from 'uuid';
import { Connection } from 'mysql';
import { User } from '../../common/models/user';
import { ContactGroup } from '../../common/models/contacts';
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

/**
 * Adds a new contact to the list of known contacts for the current user.
 */
export async function addContact(
    db: Connection, id: string, contactId: string): Promise<void> {
  await query(
    db,
    `INSERT INTO Contacts (account_id, contact_id)
     SELECT ? as account_id, ? as contact_id
     FROM DUAL
     WHERE NOT EXISTS (
       SELECT *
       FROM Contacts
       WHERE ? = account_id
         AND ? = contact_id
     )`, [id, contactId, id, contactId]);
}

/** Returns all of a user's contacts. */
export async function getContacts(
    db: Connection, id: string): Promise<User[]> {
  const results = await query(
      db,
      `SELECT
         Contacts.contact_id AS contact_id,
         Accounts.display_name AS display_name
       FROM Contacts
       INNER JOIN Accounts
       ON Accounts.id = Contacts.contact_id
       WHERE Contacts.account_id = ?`, [id]);
  const contacts: User[] = [];
  for (let i = 0; i < results.length; i++) {
    contacts.push({
      display_name: results[i]['display_name'],
      id: results[i]['contact_id'],
    });
  }
  return contacts;
}

/** Creates a new contact group and returns the ID. */
export async function createContactGroup(
    db: Connection, id: string, name: string): Promise<string> {
  const result = await query(
      db,
      `INSERT INTO ContactGroups (account_id, name)
       VALUES (?, ?)`, [id, name]);
  // To make the get query for contact groups workout, we need the group to be
  // non-empty. Therefore each group always the group owner as a member.
  await query(
      db,
      `INSERT INTO ContactGroupMembers (group_id, contact_id)
       VALUES (?, ?)`, [result.insertId, id]);
  return result.insertId;
}

/**
 * Adds a user to a contact group. This is only valid if the group specified by
 * `groupId` is owned by user with ID `id`. It is not valid to add oneself to a
 * group.
 */
export async function addContactToGroup(
    db: Connection,
    id: string,
    groupId: string,
    contactId: string): Promise<void> {
  const result = await query(
      db,
      `INSERT INTO ContactGroupMembers (group_id, contact_id)
       SELECT
          ? as group_id,
          ? as contact_id
       FROM DUAL
       WHERE NOT EXISTS (
         SELECT *
         FROM ContactGroupMembers
         WHERE ? = group_id
           AND ? = contact_id
       ) AND EXISTS (
         SELECT *
         FROM ContactGroups
         WHERE ? = id
           AND ? = account_id
       )`, [groupId, contactId, groupId, contactId, groupId, id]);
  if (result.affectedRows <= 0) {
    throw new Error('Unable to add user to group');
  }
}

/**
 * Removes a contact from a group.
 */
export async function removeContactFromGroup(
    db: Connection,
    id: string,
    groupId: string,
    contactId: string): Promise<void> {
  const result = await query(
      db,
      `DELETE FROM ContactGroupMembers
       WHERE EXISTS (
         SELECT *
         FROM ContactGroups
         WHERE ? = group_id
           AND ? = account_id
       ) AND group_id = ?
         AND contact_id = ?`, [groupId, id, groupId, contactId]);
}

/** Returns all of a user's contact groups. */
export async function getContactGroups(
    db: Connection, id: string): Promise<ContactGroup[]> {
  const results = await query(
      db,
      `SELECT
         ContactGroups.id AS group_id,
         ContactGroups.account_id AS owner_id,
         ContactGroups.name AS name,
         ContactGroupMembers.contact_id AS contact_id,
         Accounts.display_name AS display_name
       FROM ContactGroups
       INNER JOIN ContactGroupMembers
       ON ContactGroups.id = ContactGroupMembers.group_id
       INNER JOIN Accounts
       ON Accounts.id = ContactGroupMembers.contact_id
       WHERE ContactGroups.account_id = ?
       ORDER BY ContactGroups.id ASC, Accounts.display_name ASC`, [id]);
  const groups: {[id: string]: ContactGroup} = {};
  for (let i = 0; i < results.length; i++) {
    const groupId = results[i]['group_id'];
    let group = groups[groupId];
    if (!group) {
      group = {
        id: groupId,
        name: results[i]['name'],
        members: [],
      };
      groups[groupId] = group;
    }
    if (results[i]['contact_id'] == results[i]['owner_id']) {
      // Do not list the account owner as a member of the group. It is an
      // implementation detail and would confuse users.
      continue;
    }
    group.members.push({
      display_name: results[i]['display_name'],
      id: results[i]['contact_id'],
    });
  }
  return Object.values(groups);
}
