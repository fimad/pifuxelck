import { Message } from '../common/models/message';

export * from './actions/api-actions';
export * from './actions/logout';
export * from './actions/routes';

export type Action = {
  type: string,
  message: Message,
};
