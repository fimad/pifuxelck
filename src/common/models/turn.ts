import { Drawing } from './drawing';

/**
 * A struct that contains all the information of a single step in a pifuxelck
 * game.
 */
export type Turn = {
  player?: string
  is_drawing: true
  drawing: Drawing,
} | {
  player?: string
  is_drawing: false
  label: string,
};

/**
 * A struct that contains all the information that a user needs in order to take
 * a turn.
 */
export interface InboxEntry {
  game_id: string;
  previous_turn: Turn;
}

export function drawingOrDefault(turn: Turn): Drawing {
  if (turn.is_drawing === true && turn.drawing) {
    return turn.drawing;
  } else {
    return {
      background_color: {
        alpha: 1,
        blue: 1,
        green: 1,
        red: 1,
      },
      lines: [],
    };
  }
}

export function labelOrDefault(turn: Turn): string {
  if (turn.is_drawing === false && turn.label) {
    return turn.label;
  } else {
    return '';
  }
}
