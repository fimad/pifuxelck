import { Game, NewGame, NewGameError } from './game';
import { InboxEntry, Turn } from './turn';
import { Meta } from './meta';
import { User, UserError } from './user';

/**
 * Message corresponds to the top level JSON object that is returned by all end
 * points.
 */
export type Message = {
  errors?: Errors
  game?: Game
  games?: Game[]
  inbox_entries?: InboxEntry[]
  inbox_entry?: InboxEntry
  meta?: Meta
  new_game?: NewGame
  turn?: Turn
  user?: User
}

/**
 * Errors is a union of all possible error types. It is a sub-field of the
 * Message type.
 */
export type Errors = {
  application?: string[]
  user?: UserError
  new_game?: NewGameError
}

