-- -----------------------------------------------------------------------------
-- Pifuxel Migrate v5-v6
--
--    mysql -h $HOST -u $USER --password $DB < migrate-004-005.sql

ALTER TABLE Games ADD created_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE Turns ADD completed_at TIMESTAMP NULL;
UPDATE Turns
SET completed_at = NOW()
WHERE is_complete;
