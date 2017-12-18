-- -----------------------------------------------------------------------------
-- Pifuxel Migrate v7-v8
--
--    mysql -h $HOST -u $USER --password $DB < migrate-007-008.sql

ALTER TABLE Accounts ADD game_count INT(11) NOT NULL DEFAULT 0;
UPDATE Accounts
INNER JOIN (
  SELECT
    Accounts.id AS id,
    SUM(1) AS game_count
  FROM Accounts
  INNER JOIN Turns ON Accounts.id = Turns.account_id
  GROUP BY id
) X USING (id)
SET Accounts.game_count = X.game_count;
