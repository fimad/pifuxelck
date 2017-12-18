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

export type GameSizeHistogram = Array<{
  size: number
  total: number
  pending: number
  complete: number,
}>;

export type GameDurationHistogram = Array<{
  gameDurationDays: number,
  count: number,
}>;

export type UserStats = Array<{
  displayName: string
  inboxSize: number
  pendingGames: number
  startedGames: number
  drawings: number
  labels: number,
}>;

export type GamesOverTime = Array<{
  timestamp: number
  pendingGames: number,
}>;
