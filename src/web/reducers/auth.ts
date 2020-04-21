import { Message } from '../../common/models/message';
import { Action } from '../actions';

interface ActionMessage {
  message: Message;
}

export default function(auth = '', action: Action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return action.message.meta.auth;
    case 'LOGIN_FAILURE':
    case 'LOGIN_START':
    case 'REGISTER_FAILURE':
    case 'REGISTER_START':
    case 'LOGOUT':
      return '';
    default:
      if (
        (action as ActionMessage).message &&
        (action as ActionMessage).message.errors &&
        (action as ActionMessage).message.errors.auth
      ) {
        return '';
      }
      return auth;
  }
}
