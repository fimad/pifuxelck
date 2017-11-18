import { Color } from '../common/models/drawing';
import { ContactGroup } from '../common/models/contacts';
import { Game } from '../common/models/game';
import { InboxEntry, Turn } from '../common/models/turn';
import { User } from '../common/models/user';

export type Entities = {
  history: {
    [id: string]: Game
  }
  inbox: {
    [id: string]: InboxEntry
  }
  contacts: {
    [id: string]: User
  }
  contactGroups: {
    [id: string]: ContactGroup
  }
  users: {
    [displayName: string]: string
  }
};

export type Ui = {
  outbox: {
    [gameId: string]: Turn
  }
  drawing: {
    brushSize: number
    brushColor: Color
    inProgress: boolean
  }
  contacts: {
    lookup: string
  }
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
