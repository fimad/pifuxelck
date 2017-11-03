import * as mysql from 'mysql';
import { Message } from '../src/models/message';

declare global {
  namespace Express {
    export interface Request {
      db: mysql.Connection
      parseGameMessage: () => Promise<Message>
      parseTurnMessage: () => Promise<Message>
      parseUserMessage: () => Promise<Message>
    }

    export interface Response {
      success: (message: Message) => void
    }
  }
}
