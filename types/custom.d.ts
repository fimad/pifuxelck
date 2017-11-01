import * as mysql from 'mysql';
import { Message } from '../src/models/message';

declare global {
  namespace Express {
    export interface Request {
      db: mysql.Connection
      parseUserMessage: () => Promise<any>
    }

    export interface Response {
      success: (message: Message) => void
    }
  }
}
