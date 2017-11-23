import * as api from './redux-api';
import * as idbKeyval from 'idb-keyval';
import { Dispatch } from 'redux';
import { Drawing } from '../../common/models/drawing';
import { Game } from '../../common/models/game';
import { State } from '../state';
import { compareStringsAsInts } from '../../common/utils';

export function login(user: string, password: string) {
  return (dispatch: Dispatch<State>, getState: () => State) => {
    // Before logging in wipe the user's history. We don't want to conflate use
    // history between users sharing the same browser...
    idbKeyval.set('game-history', {}).then(() => {
      api.post({
        start: 'LOGIN_START',
        success: 'LOGIN_SUCCESS',
        failure: 'LOGIN_FAILURE',
        onSuccess: () => dispatch(getAllData()),
        url: '/api/2/account/login',
        body: {
          user: {
            display_name: user,
            password,
          }
        }
      })(dispatch, getState);
    });
  };
}

export function userLookup(user: string) {
  return api.get({
    start: 'USER_LOOKUP_START',
    success: 'USER_LOOKUP_SUCCESS',
    failure: 'USER_LOOKUP_FAILURE',
    url: `/api/2/contacts/lookup/${user}`,
  });
}

export function getHistory() {
  return (dispatch: Dispatch<State>, getState: () => State) => {
    dispatch({type: 'GET_HISTORY_START'});
    const getSinceId = (history?: Game[]) =>
        (history || Object.values(getState().entities.history))
        .map((x) => x.id)
        .sort(compareStringsAsInts)
        .pop() || 0;
    const getHistoryStep: any = (history?: Game[]) => api.get({
      failure: 'GET_HISTORY_STOP',
      onSuccess: (message) => {
        const {games} = message;
        if (!games || games.length <= 0) {
          idbKeyval.set('game-history', getState().entities.history).then(() => {
            dispatch({type: 'GET_HISTORY_STOP'});
          });
        } else {
          dispatch({type: 'GET_HISTORY_RECEIVE', message});
          getHistoryStep(games)(dispatch, getState);
        }
      },
      url: `/api/2/games/?since=${getSinceId(history)}`,
    });
    // First pull any cached history out of IDB before requesting more history
    // from the server.
    idbKeyval.get('game-history').then((history) => {
      if (history) {
        dispatch({type: 'GET_HISTORY_RECEIVE', message: {games: Object.values(history)}});
      }
      getHistoryStep()(dispatch, getState);
    });
  };
}

export function getInbox() {
  return api.get({
    start: 'GET_INBOX_START',
    success: 'GET_INBOX_SUCCESS',
    failure: 'GET_INBOX_FAILURE',
    url: `/api/2/games/inbox`,
  });
}

export function newGame(players: string[], label: string) {
  return api.post({
    start: 'NEW_GAME_START',
    success: 'NEW_GAME_SUCCESS',
    failure: 'NEW_GAME_FAILURE',
    url: `/api/2/games/new`,
    body: {new_game: {label, players}},
  });
}

export function playDrawingTurn(gameId: string, drawing: Drawing) {
  return (dispatch: Dispatch<State>, getState: () => State) => api.put({
    start: 'PLAY_GAME_START',
    success: 'PLAY_GAME_SUCCESS',
    failure: 'PLAY_GAME_FAILURE',
    onSuccess: () => dispatch(getInbox()),
    url: `/api/2/games/play/${gameId}`,
    body: {turn: {is_drawing: true, drawing}},
  })(dispatch, getState);
}

export function playLabelTurn(gameId: string, label: string) {
  return (dispatch: Dispatch<State>, getState: () => State) => api.put({
    start: 'PLAY_GAME_START',
    success: 'PLAY_GAME_SUCCESS',
    failure: 'PLAY_GAME_FAILURE',
    onSuccess: () => dispatch(getInbox()),
    url: `/api/2/games/play/${gameId}`,
    body: {turn: {is_drawing: false, label}},
  })(dispatch, getState);
}

export function getContacts() {
  return api.get({
    start: 'GET_CONTACTS_START',
    success: 'GET_CONTACTS_SUCCESS',
    failure: 'GET_CONTACTS_FAILURE',
    url: `/api/2/contacts`,
  });
}

export function addContact(contactId: string) {
  return (dispatch: Dispatch<State>, getState: () => State) => api.put({
    start: 'ADD_CONTACT_START',
    success: 'ADD_CONTACT_SUCCESS',
    failure: 'ADD_CONTACT_FAILURE',
    onSuccess: () => dispatch(getContacts()),
    url: `/api/2/contacts/${contactId}`,
  })(dispatch, getState);
}

export function getContactGroups() {
  return api.get({
    start: 'GET_CONTACT_GROUPS_START',
    success: 'GET_CONTACT_GROUPS_SUCCESS',
    failure: 'GET_CONTACT_GROUPS_FAILURE',
    url: `/api/2/contacts/group`,
  });
}

export function createContactGroup(name: string) {
  return api.post({
    start: 'CREATE_CONTACT_GROUP_START',
    success: 'CREATE_CONTACT_GROUP_SUCCESS',
    failure: 'CREATE_CONTACT_GROUP_FAILURE',
    url: `/api/2/contacts/group`,
    body: {contact_group: {name}},
  });
}

export function addContactToGroup(group: string, contact: string) {
  return api.put({
    start: 'ADD_CONTACT_TO_GROUP_START',
    success: 'ADD_CONTACT_TO_GROUP_SUCCESS',
    failure: 'ADD_CONTACT_TO_GROUP_FAILURE',
    url: `/api/2/contacts/group/${encodeURIComponent(group)}/${encodeURIComponent(contact)}`,
  });
}

export function removeContactToGroup(group: string, contact: string) {
  return api.del({
    start: 'REMOVE_CONTACT_TO_GROUP_START',
    success: 'REMOVE_CONTACT_TO_GROUP_SUCCESS',
    failure: 'REMOVE_CONTACT_TO_GROUP_FAILURE',
    url: `/api/2/contacts/group/${encodeURIComponent(group)}/${encodeURIComponent(contact)}`,
  });
}

export function getAllData() {
  return (dispatch: Dispatch<State>) => {
    dispatch(getContacts());
    dispatch(getHistory());
    dispatch(getInbox());
  };
}
