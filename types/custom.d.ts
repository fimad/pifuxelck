import * as mysql from 'mysql';
import { Message } from '../src/common/models/message';
import { SendMailParams } from '../src/server/middleware/mail';

declare global {
  namespace Express {
    export interface Request {
      db: mysql.Connection
      parseContactGroupMessage: () => Promise<Message>
      parseGameMessage: () => Promise<Message>
      parseTurnMessage: () => Promise<Message>
      parseUserMessage: () => Promise<Message>
      context: {[key: string]: any}
      sendMail: (params: {to: string, subject: string, body: string}) => Promise<void>
    }

    export interface Response {
      success: (message: Message) => void
    }

    export interface Application {
      sentMail: SendMailParams[]
    }
  }
}
