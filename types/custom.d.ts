import * as mysql from 'mysql';

declare global {
  namespace Express {
    export interface Request {
      db: mysql.Connection
      parseUserMessage: () => Promise<any>
    }

    export interface Response {
      success: (message: any) => void
    }
  }
}
