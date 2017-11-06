import { Game } from '../common/models/game';
import { InboxEntry } from '../common/models/turn';
import { User } from '../common/models/user';

export type Entities = {
  history: {
    [id: string]: Game,
  },
  inbox: {
    [id: string]: InboxEntry,
  },
  users: {
    [displayName: string]: string,
  },
};

/**
 * The overall state of the application.
 */
export type State = {
  entities: Entities,
  auth?: string,
};
