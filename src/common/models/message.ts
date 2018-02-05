import { ContactGroup } from './contacts';
import { Game, GameSummary, NewGame, NewGameError } from './game';
import { Meta } from './meta';
import { InboxEntry, Turn } from './turn';
import { User, UserError } from './user';

/**
 * Message corresponds to the top level JSON object that is returned by all end
 * points.
 */
export interface Message {
  errors?: Errors;
  game?: Game;
  games?: Game[];
  game_summaries?: GameSummary[];
  inbox_entries?: InboxEntry[];
  inbox_entry?: InboxEntry;
  meta?: Meta;
  new_game?: NewGame;
  turn?: Turn;
  user?: User;
  contacts?: User[];
  contact_group?: ContactGroup;
  contact_groups?: ContactGroup[];
}

/**
 * Errors is a union of all possible error types. It is a sub-field of the
 * Message type.
 */
export interface Errors {
  application?: string[];
  auth?: string;
  user?: UserError;
  new_game?: NewGameError;
}
