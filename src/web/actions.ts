import { ThunkAction } from 'redux-thunk';
import { Action as ReduxAction, Dispatch } from 'redux';
import { Color, Point } from '../common/models/drawing';
import { Message } from '../common/models/message';
import { Turn } from '../common/models/turn';
import { State } from './state';

export * from './actions/api-actions';
export * from './actions/logout';
export * from './actions/routes';
export * from './actions/ui';

export type ApiAction = {
  inProgress: boolean,
  apiName: string,
} & ({
  type: 'LOGIN_START' | 'LOGIN_FAILURE' | 'USER_LOOKUP_START' |
      'USER_LOOKUP_FAILURE' | 'GET_HISTORY_START' | 'GET_HISTORY_STOP' |
      'GET_HISTORY_FAILURE' | 'GET_INBOX_START' | 'GET_INBOX_FAILURE' |
      'CREATE_CONTACT_GROUP_SUCCESS' | 'GET_CONTACTS_START' |
      'GET_CONTACTS_FAILURE' | 'GET_CONTACT_GROUPS_START' |
      'GET_CONTACT_GROUPS_FAILURE' | 'CREATE_CONTACT_GROUP_START' |
      'CREATE_CONTACT_GROUP_FAILURE' | 'ADD_CONTACT_TO_GROUP_START' |
      'ADD_CONTACT_TO_GROUP_SUCCESS' | 'ADD_CONTACT_TO_GROUP_FAILURE' |
      'REMOVE_CONTACT_TO_GROUP_START' | 'REMOVE_CONTACT_TO_GROUP_SUCCESS' |
      'REMOVE_CONTACT_TO_GROUP_FAILURE' | 'GET_ACCOUNT_FAILURE' |
      'GET_ACCOUNT_START' | 'REGISTER_START' | 'REGISTER_FAILURE' |
      'GET_GAME_START' | 'GET_GAME_FAILURE' | 'NEW_GAME_START' |
      'NEW_GAME_FAILURE' | 'UPDATE_ACCOUNT_FAILURE' | 'UPDATE_ACCOUNT_START' |
      'UPDATE_ACCOUNT_SUCCESS',
} | {
  type: 'ADD_CONTACT_START' | 'ADD_CONTACT_FAILURE' | 'ADD_CONTACT_SUCCESS',
  contactId: string,
} | {
  type: 'IGNORE_SUGGESTION_START' | 'IGNORE_SUGGESTION_FAILURE' |
      'IGNORE_SUGGESTION_SUCCESS',
  contactId: string,
} | {
  type: 'REMOVE_CONTACT_START' | 'REMOVE_CONTACT_FAILURE',
  contactId: string,
} | {
  type: 'REMOVE_CONTACT_SUCCESS',
  contactId: string,
  message: Message,
} | {
  type: 'PLAY_GAME_START' | 'PLAY_GAME_FAILURE',
  gameId: string,
} | {
  type: 'PLAY_GAME_SUCCESS',
  gameId: string,
  message: Message,
} | {
  type: 'LOGIN_SUCCESS' | 'USER_LOOKUP_SUCCESS' | 'GET_HISTORY_SUCCESS' |
      'GET_INBOX_SUCCESS' | 'NEW_GAME_SUCCESS' | 'GET_CONTACTS_SUCCESS' |
      'GET_CONTACT_GROUPS_SUCCESS' | 'GET_ACCOUNT_SUCCESS' |
      'REGISTER_SUCCESS' | 'GET_GAME_SUCCESS'
  message: Message,
});

export type Action = (ApiAction | {
  type: 'LOGOUT' | '@@router/LOCATION_CHANGE' | 'UI_STOP_DRAWING_LINE' |
      '@@router/CALL_HISTORY_METHOD',
} | {
  type: 'UI_UPDATE_OUTBOX'
  gameId: string
  turn: Turn,
} | {
  type: 'UI_CHOOSE_BRUSH_SIZE'
  size: number,
} | {
  type: 'UI_CHOOSE_BRUSH_COLOR'
  color: Color,
} | {
  type: 'UI_UPDATE_BACKGROUND_COLOR'
  gameId: string
  color: Color,
} | {
  type: 'UI_APPEND_DRAWING_LINE'
  gameId: string
  point: Point,
} | {
  type: 'UI_START_DRAWING_LINE'
  gameId: string
  point: Point,
} | {
  type: 'UI_UNDO_DRAWING_LINE'
  gameId: string,
} | {
  type: 'UI_REDO_DRAWING_LINE'
  gameId: string,
} | {
  type: 'UI_CHANGE_CONTACT_LOOKUP'
  lookup: string,
} | {
  type: 'UI_NEW_GAME_CHANGE_TOPIC'
  topic: string,
} | {
  type: 'UI_NEW_GAME_ADD_PLAYER'
  playerId: string,
} | {
  type: 'UI_NEW_GAME_REMOVE_PLAYER'
  playerId: string,
} | {
  type: 'UI_UPDATE_EMAIL'
  email: string,
} | {
  type: 'UI_UPDATE_PASSWORD'
  password: string,
} | {
  type: 'UI_UPDATE_PASSWORD_CONFIRMATION'
  passwordConfirmation: string,
} | {
  type: 'UI_SET_ACCOUNT_PASSWORD_ERROR'
  error: string,
} | {
  type: 'UI_ADD_ERROR_SNAK'
  error: string,
} | {
  type: 'UI_REMOVE_ERROR_SNAK'
  errorId: string,
} | {
  type: 'UI_FILTER_HISTORY'
  query: string,
});

const action = (({} as any) as Action);

export type ActionType = typeof action.type;

export type WebThunkAction<ReturnType = void> = ThunkAction<
    ReturnType,
    State,
    unknown,
    ReduxAction<ActionType>
>;
