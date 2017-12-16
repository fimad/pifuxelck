-- SELECT COUNT(*) AS active_games
-- FROM Games
-- WHERE completed_at_id IS NULL;
--
-- SELECT
--   game_size,
--   SUM(1) AS total_games,
--   SUM(is_complete) AS completed_games,
--   SUM(NOT is_complete) AS pending_games
-- FROM (
--   SELECT
--     game_id,
--     Games.completed_at_id IS NOT NULL AS is_complete,
--     COUNT(*) AS game_size
--   FROM Turns
--   INNER JOIN Games ON Turns.game_id = Games.id
--   GROUP BY game_id, is_complete
-- ) X
-- GROUP BY game_size
-- ORDER BY game_size ASC;

-- SELECT
--   display_name,
--   SUM(NOT is_complete) AS pending_turns,
--   SUM(is_next_player) AS inbox_size,
--   SUM(is_first_player) AS started_games,
--   SUM(is_complete AND is_drawing) AS drawings,
--   SUM(is_complete AND NOT is_drawing) AS labels
-- FROM Accounts
-- INNER JOIN (
--   SELECT
--     account_id,
--     is_complete,
--     is_drawing,
--     Turns.id = X.min_id AS is_first_player,
--     COALESCE(Turns.id = Y.min_pending_id, FALSE) AS is_next_player
--   FROM Turns
--   INNER JOIN (
--     SELECT
--       game_id,
--       MIN(id) AS min_id
--     FROM Turns
--     GROUP BY 1
--   ) X ON Turns.game_id = X.game_id
--   LEFT JOIN (
--     SELECT
--       game_id,
--       MIN(id) AS min_pending_id
--     FROM Turns
--     WHERE NOT is_complete
--     GROUP BY 1
--   ) Y ON Turns.game_id = Y.game_id
-- ) InitialTurns ON Accounts.id = InitialTurns.account_id
-- GROUP BY 1;

-- SELECT
--   CEIL(game_duration_secs / 60 / 60 / 24) AS game_duration_days,
--   COUNT(*) as count
-- FROM (
--   SELECT
--     UNIX_TIMESTAMP(GamesCompletedAt.completed_at) -
--     UNIX_TIMESTAMP(Games.created_at) AS game_duration_secs
--   FROM Games
--   INNER JOIN GamesCompletedAt
--   ON Games.completed_at_id = GamesCompletedAt.id
-- ) X
-- WHERE game_duration_secs > 0
-- GROUP BY 1
-- ORDER BY 1 ASC;

SELECT
  Games.id AS id,
  Games.created_at AS time,
  SUM(CrossGames.id <= Games.id
      AND (CrossGames.completed_at IS NULL
          OR Games.created_at < CrossGames.completed_at))
  AS pending_games
FROM Games
CROSS JOIN (
  SELECT
    Games.id AS id,
    GamesCompletedAt.completed_at AS completed_at
  FROM Games
  LEFT JOIN GamesCompletedAt
  ON Games.completed_at_id = GamesCompletedAt.id
) AS CrossGames
GROUP BY 1
ORDER BY 1 ASC;
