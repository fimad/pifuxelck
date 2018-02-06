-- -----------------------------------------------------------------------------
-- Pifuxel Migrate v9-v10
--
--    mysql -h $HOST -u $USER --password $DB < migrate-009-010.sql

CREATE TABLE SuggestedContactNoThanks (
  account_id          INT(11)     NOT NULL,
  contact_id          INT(11)     NOT NULL,

  FOREIGN KEY (account_id) REFERENCES Accounts (id),
  FOREIGN KEY (contact_id) REFERENCES Accounts (id)
);
