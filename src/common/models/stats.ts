export interface Stats {
  gameStats: GameStats;
  gameSizes: GameSizeHistogram;
  gameDurations: GameDurationHistogram;
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
