import { Drawing } from './drawing';

/**
 * A struct that contains all the information of a single step in a pifuxelck
 * game.
 */
export type Turn = {
  player?: string
  is_drawing: true
  drawing: Drawing
} | {
  player?: string
  is_drawing: false
  label: string
}

/**
 * A struct that contains all the information that a user needs in order to take
 * a turn.
 */
export type InboxEntry = {
  game_id: string
  previous_turn: Turn
}
