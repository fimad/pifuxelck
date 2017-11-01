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

/*

func (e NewGameError) Error() string {
  return common.ModelErrorHelper(e)
}

// CreateGame creates a new game where the first turn is a label submitted by
// the given user ID, and the remaining turns are alternating drawing and labels
// with the players corresponding to the entries in the NewGame struct.
func CreateGame(userID int64, newGame NewGame) *Errors {
  if newGame.Label == "" {
    log.Debugf("Failed to create game due to lack of label.")
    return &Errors{NewGame: &NewGameError{
      Label: []string{"A label is required to start a game."},
    }}
  }

  if len(newGame.Players) <= 0 {
    log.Debugf("Failed to create game due to lack of players.")
    return &Errors{NewGame: &NewGameError{
      Players: []string{"At least one other player is required."},
    }}
  }

  genericError := []string{"Unable to create a new game at this time."}
  var errors *Errors
  db.WithTx(func(tx *sql.Tx) error {
    res, _ := tx.Exec(
      `INSERT INTO Games (completed_at_id , next_expiration)
       VALUES (NULL, NOW() + INTERVAL 2 DAY)`)

    gameID, err := res.LastInsertId()
    if err != nil {
      errors = &Errors{App: genericError}
      return err
    }

    // Insert the first turn into the database. This turn will correspond to
    // the label in the new game request and will be logged as being performed
    // by the user that is creating the game.
    _, err = tx.Exec(
      `INSERT INTO Turns
         (account_id, game_id, is_complete, is_drawing, label, drawing)
         VALUES (?, ?, 1, 0, ?, '')`,
      userID, gameID, newGame.Label)
    if err != nil {
      errors = &Errors{App: genericError}
      return err
    }

    // Create a turn entry for each player (in a random order) in the Players
    // list of newGame, alternating drawing and label turns.
    order := rand.Perm(len(newGame.Players))
    for i, v := range order {
      playerID := newGame.Players[v]
      isDrawing := i%2 == 0
      _, err := tx.Exec(
        `INSERT INTO Turns
         ( account_id
         , game_id
         , is_complete
         , is_drawing
         , label
         , drawing
         ) VALUES (?, ?, 0, ?, '', '')`,
        playerID, gameID, isDrawing)
      if err != nil {
        errors = &Errors{NewGame: &NewGameError{
          Players: []string{"No such player id " + playerID + "."},
        }}
        return err
      }
    }

    return nil
  })

  return errors
}

// UpdateGameCompletedAtTime takes a game ID and updates the completion time if
// the game is over, and does nothing otherwise.
func UpdateGameCompletedAtTime(gameID int64) *Errors {
  log.Debugf("Checking if game %v needs a completed at id.", gameID)

  err := db.WithTx(updateGameCompletedAtTimeInTx(gameID))
  if err != nil {
    return &Errors{
      App: []string{"Unable to update the game's completion time."},
    }
  }

  return nil
}

func updateGameCompletedAtTimeInTx(gameID int64) func(*sql.Tx) error {
  return func(tx *sql.Tx) error {
    // This query is a conditional insert that will create an entry in the
    // GamesCompletedAt table if and only if the game with id gameID is
    // complete AND there is not already an entry in GamesCompletedAt for this
    // game.
    res, err := tx.Exec(
      `INSERT INTO GamesCompletedAt (completed_at)
       (
          SELECT NOW()
          FROM Games
          WHERE (
              SELECT completed_at_id
              FROM Games
              WHERE id = ?) IS NULL
            AND 1 = (
                 SELECT SUM(is_complete) = COUNT(*)
                 FROM Turns
                 WHERE game_id = ?)
          LIMIT 1
       )`,
      gameID, gameID)
    if err != nil {
      log.Warnf("Query to insert completed at id failed, %v.", err)
      return err
    }

    // If there is not last inserted ID, then the game was not over. This is
    // fine, just return nil as a success.
    completedAtID, err := res.LastInsertId()
    if err != nil {
      return nil
    }

    // If there IS a completed at id, then update the game to point to this new
    // entry.
    _, err = tx.Exec(
      "UPDATE Games SET completed_at_id = ? WHERE id = ?",
      completedAtID, gameID)
    return err
  }
}

// ReapExpiredTurns removes turns from games where the expiration time has
// passed. This method should be called periodically to ensure that games to not
// hang on players who have uninstalled the app or otherwise stopped playing.
func ReapExpiredTurns() *Errors {
  log.Debugf("Reaping expired turns.")

  err := db.WithTx(func(tx *sql.Tx) error {
    // First delete turns from games where the expiration time is in the past.
    res, err := tx.Exec(
      `DELETE Turns FROM Turns
       INNER JOIN (
          SELECT
              game_id,
              MIN(id) as next_id
          FROM Turns
          WHERE is_complete = 0
          GROUP BY game_id
       ) AS NextTurn ON NextTurn.next_id = Turns.id
       INNER JOIN (
          SELECT id FROM Games
          WHERE next_expiration < NOW()
       ) AS Games ON Games.id = Turns.game_id
       WHERE Turns.id = NextTurn.next_id`)
    if err != nil {
      log.Warnf("Unable to delete expired turns, %v.", err)
      return err
    }

    expiredTurns, _ := res.RowsAffected()
    log.Debugf("Expired %v turns.", expiredTurns)

    // Next, update the remaining turns
    res, err = tx.Exec(
      `UPDATE Turns
       INNER JOIN (
          SELECT id FROM Games
          WHERE next_expiration < NOW() AND completed_at_id IS NULL
       ) AS Games ON Games.id = Turns.game_id
       SET is_drawing = NOT is_drawing
       WHERE is_complete = 0`)
    if err != nil {
      log.Warnf("Unable to update remaining turns, %v.", err)
      return err
    }

    updatedTurns, _ := res.RowsAffected()
    log.Debugf("%v turns updated to reflect new turn order.", updatedTurns)

    // Next, update the remaining turns
    res, err = tx.Exec(
      `UPDATE Games
       SET next_expiration = NOW() + INTERVAL 2 DAY
       WHERE next_expiration < NOW() AND completed_at_id IS NULL`)
    if err != nil {
      log.Warnf("Unable to update expiration time for affected games, %v.", err)
      return err
    }

    updatedGames, _ := res.RowsAffected()
    log.Debugf("%v games updated to reflect new expiration time.", updatedGames)

    // Obtain a list of all games where all of the turns are marked as complete,
    // but where the game does not have a completed at ID.
    rows, err := tx.Query(
      `SELECT Games.id
       FROM Games AS Games
       INNER JOIN (
          SELECT game_id, COUNT(*) as total
          FROM Turns
          GROUP BY game_id
       ) AS AllTurns ON AllTurns.game_id = Games.id
       INNER JOIN (
          SELECT game_id, COUNT(*) as total
          FROM Turns
          WHERE is_complete = 1
          GROUP BY game_id
       ) AS CompleteTurns ON CompleteTurns.game_id = Games.id
       WHERE Games.completed_at_id IS NULL
         AND CompleteTurns.total = AllTurns.total`)
    if err != nil {
      log.Warnf("Unable to find finshed games without a completed ID, %v", err)
      return err
    }

    gameIDs := make([]int64, 0)
    for rows.Next() {
      var id int64
      err = rows.Scan(&id)
      if err != nil {
        rows.Close()
        return err
      }
      gameIDs = append(gameIDs, id)
    }
    rows.Close()

    for _, id := range gameIDs {
      log.Verbosef("Assigning a completed at ID to game %v.", id)
      err = updateGameCompletedAtTimeInTx(id)(tx)
      if err != nil {
        return err
      }
    }

    // TODO(will): Uncomment this once the database is free of all orphaned
    // games.
    //
    // If the number of updated games does not equal the number of expired
    // turns, then fail the transaction.
    //    if updatedGames != expiredTurns {
    //      log.Warnf(
    //        "Reaping failed, number of games (%v) and turns (%v) affected differs.",
    //        updatedGames, expiredTurns)
    //      return errors.New("Inconsistent number of turns and games affected.")
    //    }

    return nil
  })

  if err != nil {
    return &Errors{App: []string{"Unable to skip expired turns."}}
  }
  return nil
}

func rowsToGames(rows *sql.Rows) []Game {
  gameIDToGame := make(map[int64]*Game)

  defer rows.Close()
  for rows.Next() {
    var gameID int64
    var completedAtID string
    var completedAt int64
    var drawingJson string
    turn := &Turn{}
    err := rows.Scan(
      &gameID, &completedAtID, &completedAt,
      &turn.Player, &turn.IsDrawing, &drawingJson, &turn.Label)
    if err != nil {
      log.Warnf("Unable to scan row, %v.", err.Error())
      continue
    }

    // Only attempt to unmarshal the drawing if it is a drawing turn.
    // Otherwise the drawing will be an empty string which is not valid JSON.
    if turn.IsDrawing {
      err := json.Unmarshal([]byte(drawingJson), &turn.Drawing)
      if err != nil {
        log.Warnf("Unable to unmarshal drawing, %v.", err.Error())
        log.Verbosef("Offending drawing JSON: %#v.", drawingJson)
        continue
      }
    }

    game := gameIDToGame[gameID]
    if game == nil {
      game = &Game{}
      game.ID = gameID
      game.CompletedAtID = completedAtID
      game.CompletedAt = completedAt
      gameIDToGame[gameID] = game
    }

    game.Turns = append(game.Turns, turn)
  }

  games := make([]Game, 0, len(gameIDToGame))
  for _, game := range gameIDToGame {
    games = append(games, *game)
  }

  return games
}

// GameByID returns a game by ID.
func GameByID(userID, gameID int64) (*Game, *Errors) {
  var game *Game
  var errors *Errors
  errMsg := []string{"No such game."}
  db.WithDB(func(db *sql.DB) {
    rows, err := db.Query(
      `SELECT
          Games.id,
          Games.completed_at_id,
          UNIX_TIMESTAMP(GamesCompletedAt.completed_at),
          Accounts.display_name,
          Turns.is_drawing,
          Turns.drawing,
          Turns.label
       From Turns as Turns
       INNER JOIN (
          SELECT id, completed_at_id
          FROM Games as Games
          INNER JOIN (
              SELECT game_id FROM Turns AS T WHERE T.account_id = ?
          ) AS T ON T.game_id = Games.id
          WHERE Games.completed_at_id IS NOT NULL AND Games.id = ?
       ) AS Games ON Turns.game_id = Games.id
       INNER JOIN (
          SELECT id, display_name
          FROM Accounts as Accounts
       ) AS Accounts ON Turns.account_id = Accounts.id
       INNER JOIN (
          SELECT id, completed_at FROM GamesCompletedAt as GamesCompletedAt
       ) AS GamesCompletedAt ON GamesCompletedAt.id = Games.completed_at_id
       GROUP BY Turns.id
       ORDER BY Games.id ASC, Turns.id ASC`,
      userID, gameID)
    if err != nil {
      log.Warnf("Unable to look up completed games, %v", err)
      errors = &Errors{App: errMsg}
      return
    }

    games := rowsToGames(rows)
    if len(games) == 0 {
      errors = &Errors{App: errMsg}
      return
    }
    game = &games[0]
  })

  if errors != nil {
    return nil, errors
  }
  return game, nil
}

// CompletedGames returns a list of games that a given user has participated in
// and that have been completed since the given completed at ID.
func CompletedGames(userID, sinceID int64) ([]Game, *Errors) {
  var games []Game
  var errors *Errors
  errMsg := []string{"Unable to query history at this time."}
  db.WithDB(func(db *sql.DB) {
    rows, err := db.Query(
      `SELECT
          Games.id,
          Games.completed_at_id,
          UNIX_TIMESTAMP(GamesCompletedAt.completed_at),
          Accounts.display_name,
          Turns.is_drawing,
          Turns.drawing,
          Turns.label
       From Turns as Turns
       INNER JOIN (
          SELECT id, completed_at_id
          FROM Games as Games
          INNER JOIN (
              SELECT game_id FROM Turns AS T WHERE T.account_id = ?
          ) AS T ON T.game_id = Games.id
          WHERE Games.completed_at_id > ?
          ORDER BY completed_at_id ASC
          LIMIT 10
       ) AS Games ON Turns.game_id = Games.id
       INNER JOIN (
          SELECT id, display_name
          FROM Accounts as Accounts
       ) AS Accounts ON Turns.account_id = Accounts.id
       INNER JOIN (
          SELECT id, completed_at FROM GamesCompletedAt as GamesCompletedAt
       ) AS GamesCompletedAt ON GamesCompletedAt.id = Games.completed_at_id
       GROUP BY Turns.id
       ORDER BY Games.id ASC, Turns.id ASC`,
      userID, sinceID)
    if err != nil {
      log.Warnf("Unable to look up completed games, %v", err)
      errors = &Errors{App: errMsg}
      return
    }

    games = rowsToGames(rows)
  })

  if errors != nil {
    return nil, errors
  }
  return games, nil
}
*/
