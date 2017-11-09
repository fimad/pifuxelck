import * as api from './redux-api';
import { Dispatch } from 'redux';
import { Drawing } from '../../common/models/drawing';
import { Game } from '../../common/models/game';
import { State } from '../state';
import { compareStringsAsInts } from '../../common/utils';

export function login(user: string, password: string) {
  return api.post({
    start: 'LOGIN_START',
    success: 'LOGIN_SUCCESS',
    failure: 'LOGIN_FAILURE',
    url: '/api/2/account/login',
    body: {
      user: {
        display_name: user,
        password,
      }
    }
  });
}

export function userLookup(user: string) {
  return api.get({
    start: 'USER_LOOKUPUP_START',
    success: 'USER_LOOKUPUP_SUCCESS',
    failure: 'USER_LOOKUPUP_FAILURE',
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
          dispatch({type: 'GET_HISTORY_STOP'});
        } else {
          dispatch({type: 'GET_HISTORY_RECEIVE', message});
          getHistoryStep(games)(dispatch, getState);
        }
      },
      url: `/api/2/games/?since=${getSinceId(history)}`,
    });
    getHistoryStep()(dispatch, getState);
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
  return api.post({
    start: 'PLAY_GAME_START',
    success: 'PLAY_GAME_SUCCESS',
    failure: 'PLAY_GAME_FAILURE',
    url: `/api/2/games/play/${gameId}`,
    body: {turn: {is_drawing: true, drawing}},
  });
}

export function playLabelTurn(gameId: string, label: string) {
  return api.post({
    start: 'PLAY_GAME_START',
    success: 'PLAY_GAME_SUCCESS',
    failure: 'PLAY_GAME_FAILURE',
    url: `/api/2/games/play/${gameId}`,
    body: {turn: {is_drawing: false, label}},
  });
}
