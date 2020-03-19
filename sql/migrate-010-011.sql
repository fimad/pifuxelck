-- -----------------------------------------------------------------------------
-- Pifuxel Migrate v10-v11
--
--    mysql -h $HOST -u $USER --password $DB < migrate-010-011.sql

ALTER TABLE ContactGroups ADD COLUMN description TEXT NOT NULL;
ALTER TABLE ContactGroups DROP FOREIGN KEY ContactGroups_ibfk_1;
ALTER TABLE ContactGroups DROP COLUMN account_id;
