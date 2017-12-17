-- -----------------------------------------------------------------------------
-- Pifuxel Migrate v6-v7
--
--    mysql -h $HOST -u $USER --password $DB < migrate-006-007.sql

ALTER TABLE Sessions ADD accessed_at TIMESTAMP NOT NULL DEFAULT NOW();
