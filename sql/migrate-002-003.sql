-- -----------------------------------------------------------------------------
-- Pifuxel Migrate v2-v3
--
--    mysql -h $HOST -u $USER --password $DB < migrate-002-003.sql

ALTER TABLE Accounts ADD password_hash BLOB;
ALTER TABLE Accounts MODIFY key_exponent BLOB;
ALTER TABLE Accounts MODIFY key_modulus BLOB;

CREATE TABLE SchemaVersion (version INT);
INSERT INTO SchemaVersion VALUES (3);
