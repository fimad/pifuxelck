import { Action } from '../actions';
import { Message } from '../../common/models/message';

type ActionMessage = {
  message: Message
};

export default function(auth = '', action: Action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return action.message.meta.auth;
    case 'LOGIN_FAILURE':
    case 'LOGIN_START':
    case 'LOGOUT':
      return '';
    default:
      if ((<ActionMessage>action).message &&
          (<ActionMessage>action).message.errors &&
          (<ActionMessage>action).message.errors.auth) {
        return '';
      }
      return auth;
  }
}
