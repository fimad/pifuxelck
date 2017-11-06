import * as mysql from 'mysql';
import { Message } from '../src/common/models/message';

declare global {
  namespace Express {
    export interface Request {
      db: mysql.Connection
      parseGameMessage: () => Promise<Message>
      parseTurnMessage: () => Promise<Message>
      parseUserMessage: () => Promise<Message>
      context: {[key: string]: any}
    }

    export interface Response {
      success: (message: Message) => void
    }
  }
}
