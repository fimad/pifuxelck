
declare module 'sql-client' {

  import * as mysql from 'mysql';

  export type SQLCallback = mysql.queryCallback

  export class SQLClient {
    connect(callback?: (err?: Error) => void): void
    disconnect(callback?: (err?: Error) => void): void
    execute: mysql.QueryFunction
  }

  export class MySQLClient extends SQLClient {
    constructor(config: mysql.ConnectionConfig)
  }

  export class SQLite3Client extends SQLClient {
    constructor(config: string)
  }
}
