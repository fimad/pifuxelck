-- -----------------------------------------------------------------------------
-- Pifuxel Migrate v3-v4
--
--    mysql -h $HOST -u $USER --password $DB < migrate-003-004.sql

DROP TABLE SchemaVersion;


CREATE TABLE Contacts (
  account_id          INT(11)     NOT NULL,
  contact_id          INT(11)     NOT NULL,

  FOREIGN KEY (account_id) REFERENCES Accounts (id),
  FOREIGN KEY (contact_id) REFERENCES Accounts (id)
);


CREATE TABLE ContactGroups (
  id                  INT(11)       NOT NULL AUTO_INCREMENT,
  name                VARCHAR(255)  NOT NULL,
  account_id          INT(11)       NOT NULL,

  PRIMARY KEY (id),
  FOREIGN KEY (account_id) REFERENCES Accounts (id)
);


CREATE TABLE ContactGroupMembers (
  group_id            INT(11)     NOT NULL,
  contact_id          INT(11)     NOT NULL,

  FOREIGN KEY (group_id) REFERENCES ContactGroups (id),
  FOREIGN KEY (contact_id) REFERENCES Accounts (id)
);
