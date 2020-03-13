export interface Stats {
  gameDurations: GameDurationHistogram;
  gameSizes: GameSizeHistogram;
  gameStats: GameStats;
  gamesOverTime: GamesOverTime;
  userStats: UserStats;
}

export interface GameStats {
  total: number;
  pending: number;
  complete: number;
}

export type GameSizeHistogram = {
  size: number
  total: number
  pending: number
  complete: number,
}[];

export type GameDurationHistogram = {
  gameDurationDays: number,
  count: number,
}[];

export type UserStats = {
  displayName: string
  drawings: number
  inboxSize: number
  labels: number,
  pendingGames: number
  skips: number,
  startedGames: number,
}[];

export type GamesOverTime = {
  timestamp: number
  pendingGames: number,
}[];
