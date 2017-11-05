import * as onFinished from 'on-finished';
import * as winston from 'winston';
import { ConnectionConfig, Connection, createConnection } from 'mysql';
import { Request, Response, NextFunction } from 'express';

export type DbConfig = ConnectionConfig;

/**
 * Middleware that will connect to a MySQL database with a given configuration,
 * and add the connection to the db fields of the request object.
 */
const db = (config : DbConfig) => {
  // Use a fresh connection to the DB for every request. If the DB is not
  // closed, unit tests will hang. This should be fine for the medium term as
  // this is deployed as a cloud function which would have a new instance per
  // request anyway.
  const dbPromise = () => new Promise<Connection>((resolve, reject) => {
    const connection = createConnection(config);
    connection.connect((err : Error) => {
      if (err) {
        reject(err);
        winston.error('Unable to connect to DB: ' + err.stack);
        return;
      }
    
      winston.info('Connected to DB');
      resolve(connection);
    });
  });
  return (req : Request, res : Response, next : NextFunction) => {
    const db = dbPromise();
    onFinished(res, () => {
      db.then((connection) => connection.end());
    });
    db.then((connection) => req.db = connection)
      .then(() => next())
      .catch((error) => res.send('FUCK UP'));
  };
};

export default db;
