import { Drawing } from './drawing';

/**
 * Turn is struct that contains all the information of a single step in a
 * pifuxelck game.
 */
export type Turn = {
  player: string
  is_drawing: boolean
  drawing: Drawing
  label: string
}

/**
 * InboxEntry is a struct that contains all the information that a user needs in
 * order to take a turn.
 */
export type InboxEntry = {
  game_id: string
  previous_turn: Turn
}

/*
func rowToInboxEntry(row common.Scannable) *InboxEntry {
  turn := &Turn{}
  entry := &InboxEntry{}
  entry.PreviousTurn = turn

  var turnID string
  var drawingJson string
  err := row.Scan(
    &turnID, &entry.GameID, &drawingJson, &turn.Label, &turn.IsDrawing)
  if err != nil {
    log.Debugf("Unable to scan row, %v.", err.Error())
    return nil
  }

  // Only attempt to unmarshal the drawing if it is a drawing turn.
  // Otherwise the drawing will be an empty string which is not valid JSON.
  if turn.IsDrawing {
    err := json.Unmarshal([]byte(drawingJson), &turn.Drawing)
    if err != nil {
      log.Debugf("Unable to unmarshal drawing, %v.", err.Error())
      return nil
    }
  }

  return entry
}

// GetInboxEntryByGameId returns an inbox entry for the given user and game id.
func GetInboxEntryByGameId(userID, gameID int64) (*InboxEntry, *Errors) {
  var entry *InboxEntry
  var errors *Errors

  var generalError = []string{"Unable to query inbox at this time."}
  db.WithDB(func(db *sql.DB) {
    log.Debugf("Querying for all available inbox entries for %v.", userID)
    row := db.QueryRow(
      `SELECT T.id, T.game_id, T.drawing, T.label, T.is_drawing
       FROM Turns AS T
       INNER JOIN (
         SELECT MIN(CT.id), CT.game_id, CT.account_id
         FROM Turns AS CT
         WHERE is_complete = 0
         GROUP BY CT.game_id
       ) AS CT ON CT.game_id = T.game_id
       INNER JOIN (
         SELECT MAX(PT.id) as previous_turn_id, PT.game_id
         FROM Turns AS PT
         WHERE is_complete = 1
         GROUP BY PT.game_id
       ) AS PT ON PT.previous_turn_id = T.id
       WHERE CT.account_id = ? AND CT.game_id = ?`,
      userID, gameID)

    entry = rowToInboxEntry(row)
    if entry == nil {
      errors = &Errors{App: generalError}
    }
  })

  return entry, errors
}

// GetInboxEntriesForUser returns a list of all inbox entries that are
// currently open for a given player. These inbox entries represent all the
// turns that the user can currently take.
func GetInboxEntriesForUser(userID int64) ([]InboxEntry, *Errors) {
  var entries []InboxEntry
  var errors *Errors

  var generalError = []string{"Unable to query inbox at this time."}
  db.WithDB(func(db *sql.DB) {
    log.Debugf("Querying for all available inbox entries for %v.", userID)
    rows, err := db.Query(
      `SELECT T.id, T.game_id, T.drawing, T.label, T.is_drawing
       FROM Turns AS T
       INNER JOIN (
         SELECT MIN(CT.id), CT.game_id, CT.account_id
         FROM Turns AS CT
         WHERE is_complete = 0
         GROUP BY CT.game_id
       ) AS CT ON CT.game_id = T.game_id
       INNER JOIN (
         SELECT MAX(PT.id) as previous_turn_id, PT.game_id
         FROM Turns AS PT
         WHERE is_complete = 1
         GROUP BY PT.game_id
       ) AS PT ON PT.previous_turn_id = T.id
       WHERE CT.account_id = ?`,
      userID)
    if err != nil {
      log.Debugf("Querying failed, %v.", err.Error())
      errors = &Errors{App: generalError}
      return
    }

    entries = make([]InboxEntry, 0, 8)
    for rows.Next() {
      entry := rowToInboxEntry(rows)
      if entry != nil {
        entries = append(entries, *entry)
      }
    }
    rows.Close()

    return
  })

  return entries, errors
}

// UpdateDrawingTurn updates the users turn in a given game with a label. This
// will fail if the user is not the next player, or if the next turn is not a
// label turn.
func UpdateDrawingTurn(userID, gameID int64, drawing *Drawing) *Errors {
  log.Debugf("User %v updating drawing in game %v.", userID, gameID)

  var errors *Errors
  errMsg := []string{"It is not your turn to label a drawing."}
  db.WithDB(func(db *sql.DB) {
    drawingJson, err := json.Marshal(drawing)
    if err != nil {
      log.Warnf("Unable to marshal drawing into JSON, %v.", err)
      errors = &Errors{App: errMsg}
    }

    res, err := db.Exec(
      `UPDATE Turns, Games
       SET
          drawing = ?,
          is_complete = 1,
          Games.next_expiration = NOW() + INTERVAL 2 DAY
       WHERE Turns.game_id = Games.id
         AND Turns.account_id = ?
         AND Turns.game_id = ?
         AND Turns.is_drawing = 1
         AND Turns.id = (
              SELECT MIN(T.id)
              FROM (SELECT * FROM Turns) AS T
              WHERE T.is_complete = 0 AND T.game_id = ?)`,
      drawingJson, userID, gameID, gameID)

    if err != nil {
      log.Debugf("Drawing turn update failed, %v.", err)
      errors = &Errors{App: errMsg}
      return
    }

    i, err := res.RowsAffected()
    if i <= 0 || err != nil {
      log.Debugf("Drawing turn update failed because no rows were affected.")
      errors = &Errors{App: errMsg}
      return
    }
  })
  return errors
}

// UpdateLabelTurn updates the users turn in a given game with a drawing. This
// will fail if the user is not the next player, or if the next turn is not a
// drawing turn.
func UpdateLabelTurn(userID, gameID int64, label string) *Errors {
  log.Debugf("User %v updating drawing in game %v.", userID, gameID)

  var errors *Errors
  errMsg := []string{"It is not your turn to label a drawing."}
  db.WithDB(func(db *sql.DB) {
    res, err := db.Exec(
      `UPDATE Turns, Games
       SET
          Turns.label = ?,
          Turns.is_complete = 1,
          Games.next_expiration = NOW() + INTERVAL 2 DAY
       WHERE Turns.game_id = Games.id
         AND Turns.account_id = ?
         AND Turns.game_id = ?
         AND Turns.is_drawing = 0
         AND Turns.id = (
              SELECT MIN(T.id)
              FROM (SELECT * FROM Turns) AS T
              WHERE T.is_complete = 0 AND T.game_id = ?)`,
      label, userID, gameID, gameID)

    if err != nil {
      log.Debugf("Label turn update failed, %v.", err)
      errors = &Errors{App: errMsg}
      return
    }

    i, err := res.RowsAffected()
    if i <= 0 || err != nil {
      log.Debugf("Label turn update failed because no rows were affected.")
      errors = &Errors{App: errMsg}
      return
    }
  })
  return errors
}
*/
