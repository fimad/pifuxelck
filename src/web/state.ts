import { Game } from '../common/models/game';
import { InboxEntry } from '../common/models/turn';
import { combineReducers, ReducersMapObject } from 'redux';

/**
 * The overall state of the application.
 */
export type State = {
  entities: {
    history: {
      [id: string]: Game,
    },
    inbox: {
      [id: string]: InboxEntry,
    },
  },
};

export const reducers = {
} as ReducersMapObject;
