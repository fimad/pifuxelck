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
      'PLAY_GAME_FAILURE' | 'LOGOUT'
} | {
  type: 'LOGIN_SUCCESS'
  message: Message
} | {
  type: 'USER_LOOKUP_SUCCESS'
  message: Message
} | {
  type: 'GET_HISTORY_RECEIVE'
  message: Message
} | {
  type: 'GET_INBOX_SUCCESS'
  message: Message
} | {
  type: 'NEW_GAME_SUCCESS'
  message: Message
} | {
  type: 'PLAY_GAME_SUCCESS'
  message: Message
} | {
  type: 'UI_UPDATE_OUTBOX'
  gameId: string
  turn: Turn
});
