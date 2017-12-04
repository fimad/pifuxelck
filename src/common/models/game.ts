import { Turn } from './turn';

export interface Game {
  id: string;
  turns: Turn[];
  completed_at: string;
  completed_at_id: string;
}

export interface NewGame {
  label: string;
  players: string[];
}

export interface NewGameError {
  label: string[];
  players: string[];
}
