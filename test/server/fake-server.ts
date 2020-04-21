import { readFile } from 'fs';

import { Connection, createConnection } from 'mysql';

import config from '../../config/test';
import { SendMailParams } from '../../src/server/middleware/mail';
import { hashPassword } from '../../src/server/models/user';
import server from '../../src/server/server';

export type Options = {
  sqlFile: string;
  passwordOverride: string;
};

export default async function fakeServer(options: Partial<Options> = {}) {
  const sqlFile = options.sqlFile || 'sql/schema-current.sql';
  const dbConfig = config.db;

  // The schema file should automatically drop tables which should handle
  // clearing tate in between tests.
  const sqlDb = await new Promise<Connection>((resolve, reject) => {
    const connection = createConnection({
      ...dbConfig,
      multipleStatements: true,
    });
    connection.connect((err) => (err ? reject(err) : resolve(connection)));
  });
  const schema = await new Promise((resolve, reject) =>
    readFile(sqlFile, 'utf8', (err, val) => (err ? reject(err) : resolve(val)))
  );
  await new Promise((resolve, reject) =>
    sqlDb.query(schema.toString(), (err) => (err ? reject(err) : resolve()))
  );
  if (options.passwordOverride) {
    const passwordHash = await hashPassword(options.passwordOverride);
    await new Promise((resolve, reject) =>
      sqlDb.query(
        'UPDATE Accounts SET password_hash = ?',
        [passwordHash],
        (err) => (err ? reject(err) : resolve())
      )
    );
  }
  sqlDb.end();

  const sentMail = [] as SendMailParams[];
  const app = server({
    ...config,
    mail: {
      sendMail: (params: SendMailParams) => {
        sentMail.push(params);
        return Promise.resolve();
      },
    },
  });
  app.sentMail = sentMail;
  return app;
}
