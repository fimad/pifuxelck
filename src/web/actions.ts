import { Color, Point } from '../common/models/drawing';
import { Message } from '../common/models/message';
import { Turn } from '../common/models/turn';

export * from './actions/api-actions';
export * from './actions/logout';
export * from './actions/routes';
export * from './actions/ui';

export type Action = ({
  type: 'LOGIN_START' | 'LOGIN_FAILURE' | 'USER_LOOKUP_START' |
      'USER_LOOKUP_FAILURE' | 'GET_HISTORY_START' | 'GET_HISTORY_STOP' |
      'GET_INBOX_START' | 'GET_INBOX_FAILURE' | 'PLAY_GAME_START' |
      'PLAY_GAME_FAILURE' | 'LOGOUT' | '@@router/LOCATION_CHANGE' |
      'UI_STOP_DRAWING_LINE' | 'ADD_CONTACT_SUCCESS' |
      'CREATE_CONTACT_GROUP_SUCCESS' | 'GET_CONTACTS_START' |
      'GET_CONTACTS_FAILURE' | 'ADD_CONTACT_START' | 'ADD_CONTACT_FAILURE' |
      'GET_CONTACT_GROUPS_START' | 'GET_CONTACT_GROUPS_FAILURE' |
      'CREATE_CONTACT_GROUP_START' | 'CREATE_CONTACT_GROUP_FAILURE' |
      'ADD_CONTACT_TO_GROUP_START' | 'ADD_CONTACT_TO_GROUP_SUCCESS' |
      'ADD_CONTACT_TO_GROUP_FAILURE' | 'REMOVE_CONTACT_TO_GROUP_START' |
      'REMOVE_CONTACT_TO_GROUP_SUCCESS' | 'REMOVE_CONTACT_TO_GROUP_FAILURE'
} | {
  type: 'LOGIN_SUCCESS' | 'USER_LOOKUP_SUCCESS' | 'GET_HISTORY_RECEIVE' |
      'GET_INBOX_SUCCESS' | 'NEW_GAME_SUCCESS' | 'PLAY_GAME_SUCCESS' |
      'GET_CONTACTS_SUCCESS' | 'GET_CONTACT_GROUPS_SUCCESS'
  message: Message
} | {
  type: 'UI_UPDATE_OUTBOX'
  gameId: string
  turn: Turn
} | {
  type: 'UI_CHOOSE_BRUSH_SIZE'
  size: number
} | {
  type: 'UI_CHOOSE_BRUSH_COLOR'
  color: Color
} | {
  type: 'UI_UPDATE_BACKGROUND_COLOR'
  gameId: string
  color: Color
} | {
  type: 'UI_APPEND_DRAWING_LINE'
  gameId: string
  point: Point
} | {
  type: 'UI_START_DRAWING_LINE'
  gameId: string
  point: Point
} | {
  type: 'UI_UNDO_DRAWING_LINE'
  gameId: string
} | {
  type: 'UI_CHANGE_CONTACT_LOOKUP'
  lookup: string
});

