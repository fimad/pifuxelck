import { ContactGroup } from '../common/models/contacts';
import { Color } from '../common/models/drawing';
import { Game } from '../common/models/game';
import { InboxEntry, Turn } from '../common/models/turn';
import { User } from '../common/models/user';

export interface Entities {
  history: {
    [id: string]: Game,
  };
  inbox: {
    [id: string]: InboxEntry,
  };
  contacts: {
    [id: string]: User,
  };
  contactGroups: {
    [id: string]: ContactGroup,
  };
  users: {
    [displayName: string]: string,
  };
  account: {
    email: string,
  };
}

export interface Ui {
  account: {
    email: (string|null)
    password: (string|null),
    passwordConfirmation: (string|null),
    passwordError: string,
  };
  outbox: {
    [gameId: string]: Turn,
  };
  drawing: {
    brushSize: number
    brushColor: Color
    inProgress: boolean,
  };
  contacts: {
    lookup: string,
  };
  newGame: {
    topic: string
    users: string[],
  };
}

export interface ApiStatus {
  inProgress: {
    [api: string]: boolean,
  };
  pendingTurns: {
    [gameId: string]: boolean,
  };
}

/**
 * The overall state of the application.
 */
export interface State {
  /** Locally cached server side state. */
  entities: Entities;

  ui: Ui;

  /** The auth token, if present the user is logged in. */
  auth?: string;

  apiStatus: ApiStatus;
}
