import { Turn } from './turn';

export type Game = {
  id: string
  turns: Turn[]
  completed_at: string
  completed_at_id: string
}

export type NewGame = {
  label:  string
  players: string[]
}

export type NewGameError = {
  label: string[]
  players: string[]
}
