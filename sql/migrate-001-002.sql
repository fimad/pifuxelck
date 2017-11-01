-- -----------------------------------------------------------------------------
-- Pifuxel Migrate v1-v2
--
-- This script will migrate a schema from v1 to v2 in place. To use:
--
--    mysql -h $HOST -u $USER --password $DB < migrate-001-002.sql

ALTER TABLE Games ADD next_expiration TIMESTAMP NOT NULL;
UPDATE Games SET next_expiration = NOW() + INTERVAL 2 DAY;
