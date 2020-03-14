import * as idbKeyval from 'idb-keyval';
import { Dispatch } from 'redux';
import { Drawing } from '../../common/models/drawing';
import { Game } from '../../common/models/game';
import { User } from '../../common/models/user';
import { compareStringsAsInts } from '../../common/utils';
import { WebThunkAction } from '../actions';
import { State } from '../state';
import * as api from './redux-api';

export function login(user: string, password: string): WebThunkAction {
  return (dispatch, getState, extra) => {
    // Before logging in wipe the user's history. We don't want to conflate use
    // history between users sharing the same browser...
    idbKeyval.clear().then(() => {
      api.post({
        body: {
          user: {
            display_name: user,
            password,
          },
        },
        errorMessage: 'Invalid username or password.',
        failure: 'LOGIN_FAILURE',
        name: 'LOGIN',
        onSuccess: () => dispatch(getAllData()),
        start: 'LOGIN_START',
        success: 'LOGIN_SUCCESS',
        url: '/api/2/account/login',
      })(dispatch, getState, extra);
    });
  };
}

export function register(user: string, password: string): WebThunkAction {
  return (dispatch, getState, extra) => {
    // Before logging in wipe the user's history. We don't want to conflate use
    // history between users sharing the same browser...
    idbKeyval.clear().then(() => {
      api.post({
        body: {
          user: {
            display_name: user,
            password,
          },
        },
        failure: 'REGISTER_FAILURE',
        name: 'REGISTER',
        onSuccess: () => dispatch(getAllData()),
        start: 'REGISTER_START',
        success: 'REGISTER_SUCCESS',
        url: '/api/2/account/register',
      })(dispatch, getState, extra);
    });
  };
}

export function userLookup(user: string) {
  return api.get({
    allowConcurrent: true,
    failure: 'USER_LOOKUP_FAILURE',
    name: 'USER_LOOKUP',
    requireAuth: true,
    start: 'USER_LOOKUP_START',
    success: 'USER_LOOKUP_SUCCESS',
    url: `/api/2/contacts/lookup/${user}`,
  });
}

export function getGame(id: string): WebThunkAction {
  return (dispatch, getState, extra) => {
    if (getState().entities.gameCache[id]) {
      return;
    }
    const key = `game=${id}`;
    idbKeyval.get(key).then((game) => {
      if (game) {
        dispatch({
          message: { game },
          type: 'GET_GAME_SUCCESS',
        });
      } else {
        api.get({
          allowConcurrent: false,
          failure: 'GET_GAME_FAILURE',
          name: `GET_GAME_${id}`,
          onSuccess: (message) => {
            if (message.game) {
              idbKeyval.set(key, message.game);
            }
          },
          requireAuth: true,
          start: 'GET_GAME_START',
          success: 'GET_GAME_SUCCESS',
          url: `/api/2/games/${id}`,
        })(dispatch, getState, extra);
      }
    });
  };
}

export function getHistory() {
  return api.get({
    failure: 'GET_HISTORY_FAILURE',
    name: 'GET_HISTORY',
    requireAuth: true,
    start: 'GET_HISTORY_START',
    success: 'GET_HISTORY_SUCCESS',
    url: `/api/2/games/summary`,
  });
}

export function getInbox() {
  return api.get({
    failure: 'GET_INBOX_FAILURE',
    name: 'GET_INBOX',
    requireAuth: true,
    start: 'GET_INBOX_START',
    success: 'GET_INBOX_SUCCESS',
    url: `/api/2/games/inbox`,
  });
}

export function newGame(players: string[], label: string) {
  return api.post({
    body: { new_game: { label, players } },
    errorMessage: 'Unable to create game.',
    failure: 'NEW_GAME_FAILURE',
    name: 'NEW_GAME',
    requireAuth: true,
    start: 'NEW_GAME_START',
    success: 'NEW_GAME_SUCCESS',
    url: `/api/2/games/new`,
  });
}

export function playDrawingTurn(
  gameId: string,
  drawing: Drawing
): WebThunkAction {
  return (dispatch, getState, extra) =>
    api.put({
      body: { turn: { is_drawing: true, drawing } },
      errorMessage: 'Unable to send reply.',
      extra: { gameId },
      failure: 'PLAY_GAME_FAILURE',
      name: 'PLAY_GAME',
      onSuccess: () => dispatch(getInbox()),
      requireAuth: true,
      start: 'PLAY_GAME_START',
      success: 'PLAY_GAME_SUCCESS',
      url: `/api/2/games/play/${gameId}`,
    })(dispatch, getState, extra);
}

export function playLabelTurn(gameId: string, label: string): WebThunkAction {
  return (dispatch, getState, extra) =>
    api.put({
      body: { turn: { is_drawing: false, label } },
      errorMessage: 'Unable to send reply.',
      extra: { gameId },
      failure: 'PLAY_GAME_FAILURE',
      name: 'PLAY_GAME',
      onSuccess: () => dispatch(getInbox()),
      requireAuth: true,
      start: 'PLAY_GAME_START',
      success: 'PLAY_GAME_SUCCESS',
      url: `/api/2/games/play/${gameId}`,
    })(dispatch, getState, extra);
}

export function getContacts() {
  return api.get({
    failure: 'GET_CONTACTS_FAILURE',
    name: 'GET_CONTACTS',
    requireAuth: true,
    start: 'GET_CONTACTS_START',
    success: 'GET_CONTACTS_SUCCESS',
    url: `/api/2/contacts`,
  });
}

export function addContact(contactId: string): WebThunkAction {
  return (dispatch, getState, extra) =>
    api.put({
      allowConcurrent: true,
      errorMessage: 'Unable to add contact.',
      extra: { contactId },
      failure: 'ADD_CONTACT_FAILURE',
      name: 'ADD_CONTACT',
      onSuccess: () => dispatch(getContacts()),
      requireAuth: true,
      start: 'ADD_CONTACT_START',
      success: 'ADD_CONTACT_SUCCESS',
      url: `/api/2/contacts/${contactId}`,
    })(dispatch, getState, extra);
}

export function removeContact(contactId: string): WebThunkAction {
  return (dispatch, getState, extra) =>
    api.del({
      allowConcurrent: true,
      errorMessage: 'Unable to remove contact.',
      extra: { contactId },
      failure: 'REMOVE_CONTACT_FAILURE',
      name: 'REMOVE_CONTACT',
      onSuccess: () => dispatch(getContacts()),
      requireAuth: true,
      start: 'REMOVE_CONTACT_START',
      success: 'REMOVE_CONTACT_SUCCESS',
      url: `/api/2/contacts/${contactId}`,
    })(dispatch, getState, extra);
}

export function getContactGroups() {
  return api.get({
    failure: 'GET_CONTACT_GROUPS_FAILURE',
    name: 'GET_CONTACT_GROUPS',
    requireAuth: true,
    start: 'GET_CONTACT_GROUPS_START',
    success: 'GET_CONTACT_GROUPS_SUCCESS',
    url: `/api/2/contacts/group`,
  });
}

export function createContactGroup(name: string) {
  return api.post({
    body: { contact_group: { name } },
    failure: 'CREATE_CONTACT_GROUP_FAILURE',
    name: 'CREATE_CONTACT_GROUP',
    requireAuth: true,
    start: 'CREATE_CONTACT_GROUP_START',
    success: 'CREATE_CONTACT_GROUP_SUCCESS',
    url: `/api/2/contacts/group`,
  });
}

export function addContactToGroup(group: string, contact: string) {
  return api.put({
    failure: 'ADD_CONTACT_TO_GROUP_FAILURE',
    name: 'ADD_CONTACT_TO_GROUP',
    requireAuth: true,
    start: 'ADD_CONTACT_TO_GROUP_START',
    success: 'ADD_CONTACT_TO_GROUP_SUCCESS',
    url:
      `/api/2/contacts/group/` +
      `${encodeURIComponent(group)}/${encodeURIComponent(contact)}`,
  });
}

export function removeContactToGroup(group: string, contact: string) {
  return api.del({
    failure: 'REMOVE_CONTACT_TO_GROUP_FAILURE',
    name: 'REMOVE_CONTACT_TO_GROUP',
    requireAuth: true,
    start: 'REMOVE_CONTACT_TO_GROUP_START',
    success: 'REMOVE_CONTACT_TO_GROUP_SUCCESS',
    url:
      `/api/2/contacts/group/` +
      `${encodeURIComponent(group)}/${encodeURIComponent(contact)}`,
  });
}

export function updateAccount(user: User) {
  return api.put({
    body: { user },
    errorMessage: 'Unable to update account info',
    failure: 'UPDATE_ACCOUNT_FAILURE',
    name: 'UPDATE_ACCOUNT',
    requireAuth: true,
    start: 'UPDATE_ACCOUNT_START',
    success: 'UPDATE_ACCOUNT_SUCCESS',
    url: `/api/2/account`,
  });
}

export function getAccount() {
  return api.get({
    failure: 'GET_ACCOUNT_FAILURE',
    name: 'GET_ACCOUNT',
    requireAuth: true,
    start: 'GET_ACCOUNT_START',
    success: 'GET_ACCOUNT_SUCCESS',
    url: `/api/2/account`,
  });
}

export function ignoreSuggestedContacts(contactId: string): WebThunkAction {
  return (dispatch, getState, extra) =>
    api.put({
      allowConcurrent: true,
      errorMessage: 'Unable to ignore suggestion.',
      extra: { contactId },
      failure: 'IGNORE_SUGGESTION_FAILURE',
      name: 'IGNORE_SUGGESTION',
      onSuccess: () => dispatch(getContacts()),
      requireAuth: true,
      start: 'IGNORE_SUGGESTION_START',
      success: 'IGNORE_SUGGESTION_SUCCESS',
      url: `/api/2/contacts/nothanks/${contactId}`,
    })(dispatch, getState, extra);
}

export function getAllData(): WebThunkAction {
  return (dispatch, getState, extra) =>
    api.get({
      failure: 'CHECK_ACCOUNT_FAILURE',
      name: 'CHECK_ACCOUNT',
      requireAuth: true,
      start: 'CHECK_ACCOUNT_START',
      success: 'CHECK_ACCOUNT_SUCCESS',
      onSuccess: () => {
        dispatch(getAccount());
        dispatch(getContacts());
        dispatch(getInbox());
        dispatch(getHistory());
      },
      url: `/api/2/account/check`,
    })(dispatch, getState, extra);
}
