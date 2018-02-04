-- -----------------------------------------------------------------------------
-- Pifuxel Migrate v8-v9
--
--    mysql -h $HOST -u $USER --password $DB < migrate-007-008.sql

CREATE INDEX GameIdToTurn ON Turns (game_id);
