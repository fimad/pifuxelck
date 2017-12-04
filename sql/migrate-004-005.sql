-- -----------------------------------------------------------------------------
-- Pifuxel Migrate v4-v5
--
--    mysql -h $HOST -u $USER --password $DB < migrate-004-005.sql

ALTER TABLE Accounts ADD email TEXT;

ALTER TABLE Games ADD did_notify BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE Games SET did_notify = TRUE;

ALTER TABLE Turns ADD did_notify BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE Turns SET did_notify = TRUE;
