import { ContactGroup, SuggestedContact } from '../common/models/contacts';
import { Color, Line } from '../common/models/drawing';
import { Game, GameSummary } from '../common/models/game';
import { InboxEntry, Turn } from '../common/models/turn';
import { User } from '../common/models/user';

export interface Entities {
  history: {
    [id: string]: GameSummary;
  };
  inbox: {
    [id: string]: InboxEntry;
  };
  contacts: {
    [id: string]: User;
  };
  suggestedContacts: {
    [id: string]: SuggestedContact;
  };
  contactGroups: {
    [id: string]: ContactGroup;
  };
  users: {
    [displayName: string]: string;
  };
  account: {
    email: string;
  };

  /**
   * Histories can be very memory intensive and slow to load and work with.
   * Therefore only a small number are kept loaded in memory at a time.
   */
  gameCache: {
    [id: string]: Game;
  };
}

export interface OutboxEntry {
  redo: Line[];
  turn: Turn;
}

export interface Ui {
  account: {
    email: string | null;
    password: string | null;
    passwordConfirmation: string | null;
    passwordError: string;
  };
  contacts: {
    lookup: string;
  };
  drawing: {
    brushSize: number;
    brushColor: Color;
    inProgress: boolean;
  };
  errors: {
    nextId: number;
    messages: {
      [id: string]: string;
    };
  };
  history: {
    query: string | null;
  };
  newGame: {
    topic: string;
    users: string[];
  };
  outbox: {
    [gameId: string]: OutboxEntry;
  };
}

export interface ApiStatus {
  inProgress: {
    [api: string]: boolean;
  };
  pendingTurns: {
    [gameId: string]: boolean;
  };
  pendingContactDeletes: {
    [id: string]: boolean;
  };
  pendingContactAdds: {
    [id: string]: boolean;
  };
  pendingSuggestionIgnores: {
    [id: string]: boolean;
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
