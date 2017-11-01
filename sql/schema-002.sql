-- -----------------------------------------------------------------------------
-- Pifuxel Schema v2
--
-- This script will blow away existing tables and create new ones in there
-- place. To use:
--
--    mysql -h $HOST -u $USER --password $DB < schema-002.sql

DROP TABLE IF EXISTS Turns;
DROP TABLE IF EXISTS Games;
DROP TABLE IF EXISTS GamesCompletedAt;

DROP TABLE IF EXISTS Sessions;
DROP TABLE IF EXISTS LoginChallenges;
DROP TABLE IF EXISTS Accounts;


CREATE TABLE Accounts (
  id                  INT(11)     NOT NULL AUTO_INCREMENT,
  key_exponent        BLOB        NOT NULL,
  key_modulus         BLOB        NOT NULL,
  display_name        VARCHAR(32) NOT NULL UNIQUE,
  hashed_phone_number CHAR(64),
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
  created_at          TIMESTAMP   NOT NULL,

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

  PRIMARY KEY (id),
  FOREIGN KEY (account_id) REFERENCES Accounts (id),
  FOREIGN KEY (game_id)    REFERENCES Games (id)
);
