import config from '../config/test';
import server from '../src/server';
import { Connection, createConnection } from 'mysql';
import { readFile } from 'fs';

export default async function fakeServer() {
  const dbConfig = config.db;

  // The schema file should automatically drop tables which should handle
  // clearing tate in between tests.
  const sqlDb = await new Promise<Connection>((resolve, reject) => {
    const connection = createConnection({
      ...dbConfig,
      multipleStatements: true,
    });
    connection.connect((err) => err ? reject(err) : resolve(connection));
  });
  const schema = await new Promise((resolve, reject) =>
      readFile(
          'sql/schema-current.sql', 'utf8',
          (err, val) => err ? reject(err) : resolve(val)));
  await new Promise((resolve, reject) =>
      sqlDb.query(schema.toString(), (err) => err ? reject(err) : resolve()));
  sqlDb.end();

  // Create a server using the same temporary in-memory SQLite database.
  return server({db: dbConfig});
}
