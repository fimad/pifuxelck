-- -----------------------------------------------------------------------------
-- Pifuxel Schema v11
--
-- This script will blow away existing tables and create new ones in there
-- place. To use:
--
--    mysql -h $HOST -u $USER --password $DB < schema-011.sql

-- For testing, the following settings result in a 3x speed up in table
-- creation.
--
-- SET GLOBAL innodb_file_per_table = 0;
-- SET GLOBAL innodb_stats_persistent = 0;

DROP TABLE IF EXISTS SuggestedContactNoThanks;
DROP TABLE IF EXISTS Contacts;
DROP TABLE IF EXISTS ContactGroupMembers;
DROP TABLE IF EXISTS ContactGroups;

DROP TABLE IF EXISTS Turns;
DROP TABLE IF EXISTS Games;
DROP TABLE IF EXISTS GamesCompletedAt;

DROP TABLE IF EXISTS Sessions;
DROP TABLE IF EXISTS LoginChallenges;
DROP TABLE IF EXISTS Accounts;

DROP TABLE IF EXISTS SchemaVersion;


CREATE TABLE Accounts (
  id                  INT(11)     NOT NULL AUTO_INCREMENT,
  key_exponent        BLOB,
  key_modulus         BLOB,
  display_name        VARCHAR(32) NOT NULL UNIQUE,
  hashed_phone_number CHAR(64),
  password_hash       BLOB,
  email               TEXT,
  game_count          INT(11)     NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);


CREATE TABLE LoginChallenges (
  id                  INT(11)     NOT NULL AUTO_INCREMENT,
  challenge           BLOB        NOT NULL,
  account_id          INT(11)     NOT NULL,
  created_at          TIMESTAMP   NOT NULL,

  PRIMARY KEY (id),
  FOREIGN KEY (account_id) REFERENCES Accounts (id)
);


CREATE TABLE Sessions (
  id                  INT(11)     NOT NULL AUTO_INCREMENT,
  auth_token          TEXT        NOT NULL,
  account_id          INT(11)     NOT NULL,
  created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
  accessed_at         TIMESTAMP   NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id),
  FOREIGN KEY (account_id) REFERENCES Accounts (id)
);


CREATE TABLE GamesCompletedAt (
  id                  INT(11)     NOT NULL AUTO_INCREMENT,
  completed_at        TIMESTAMP   NULL,

  PRIMARY KEY (id)
);


CREATE TABLE Games (
  id                  INT(11)     NOT NULL AUTO_INCREMENT,
  completed_at_id     INT(11)     NULL,
  next_expiration     TIMESTAMP   NULL,
  did_notify          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id),
  FOREIGN KEY (completed_at_id) REFERENCES GamesCompletedAt (id)
);


CREATE TABLE Turns (
  id                  INT(11)     NOT NULL AUTO_INCREMENT,
  account_id          INT(11)     NOT NULL,
  game_id             INT(11)     NOT NULL,
  is_complete         BOOLEAN     NOT NULL,
  is_drawing          BOOLEAN     NOT NULL,
  label               TEXT        NOT NULL,
  drawing             MEDIUMTEXT  NOT NULL,
  did_notify          BOOLEAN     NOT NULL DEFAULT FALSE,
  completed_at        TIMESTAMP   NULL,

  PRIMARY KEY (id),
  FOREIGN KEY (account_id) REFERENCES Accounts (id),
  FOREIGN KEY (game_id)    REFERENCES Games (id)
);
CREATE INDEX GameIdToTurn ON Turns (game_id);


CREATE TABLE Contacts (
  account_id          INT(11)     NOT NULL,
  contact_id          INT(11)     NOT NULL,

  FOREIGN KEY (account_id) REFERENCES Accounts (id),
  FOREIGN KEY (contact_id) REFERENCES Accounts (id)
);


CREATE TABLE ContactGroups (
  id                  INT(11)       NOT NULL AUTO_INCREMENT,
  name                VARCHAR(255)  NOT NULL,
  description         TEXT          NOT NULL,

  PRIMARY KEY (id)
);


CREATE TABLE ContactGroupMembers (
  group_id            INT(11)     NOT NULL,
  contact_id          INT(11)     NOT NULL,

  FOREIGN KEY (group_id) REFERENCES ContactGroups (id),
  FOREIGN KEY (contact_id) REFERENCES Accounts (id)
);


CREATE TABLE SuggestedContactNoThanks (
  account_id          INT(11)     NOT NULL,
  contact_id          INT(11)     NOT NULL,

  FOREIGN KEY (account_id) REFERENCES Accounts (id),
  FOREIGN KEY (contact_id) REFERENCES Accounts (id)
);

