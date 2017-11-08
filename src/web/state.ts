import { Game } from '../common/models/game';
import { InboxEntry, Turn } from '../common/models/turn';
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

export type Ui = {
  outbox: {
    [gameId: string]: Turn,
  },
};

/**
 * The overall state of the application.
 */
export type State = {
  /** Locally cached server side state. */
  entities: Entities,

  ui: Ui,

  /** The auth token, if present the user is logged in. */
  auth?: string,
};
