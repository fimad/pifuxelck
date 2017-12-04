import { ContactGroup } from '../../common/models/contacts';
import { Message } from '../../common/models/message';
import { User } from '../../common/models/user';
import { mapFrom } from '../../common/utils';
import { Action } from '../actions';
import { Entities } from '../state';

interface ActionMessage {
  message: Message;
}

const initialState = {
  contactGroups: {},
  contacts: {},
  history: {},
  inbox: {},
  users: {},
};

export default function(state: Entities = initialState, action: Action) {
  switch (action.type) {
    case 'USER_LOOKUP_SUCCESS':
      if (action.message && action.message.user) {
        return {
          ...state,
          users: {
            ...state.users,
            [action.message.user.display_name]: action.message.user.id,
          },
        };
      }
      break;
    case 'GET_HISTORY_RECEIVE':
      if (action.message && action.message.games) {
        return {
          ...state,
          history: {
            ...state.history,
            ...mapFrom(action.message.games, (x) => x.id),
          },
        };
      }
      break;
    case 'GET_INBOX_SUCCESS':
      if (action.message && action.message.inbox_entries) {
        return {
          ...state,
          inbox: {
              ...mapFrom(action.message.inbox_entries, (x) => x.game_id),
          },
        };
      }
      break;
    case 'GET_CONTACTS_SUCCESS':
      if (action.message && action.message.contacts) {
        return {
          ...state,
          contacts: action.message.contacts.reduce((obj, x) => {
            obj[x.id] = x;
            return obj;
          }, {} as {[id: string]: User}),
        };
      }
      break;
    case 'GET_CONTACTS_SUCCESS':
      if (action.message && action.message.contact_groups) {
        return {
          ...state,
          contactGroups: action.message.contact_groups.reduce((obj, x) => {
            obj[x.id] = x;
            return obj;
          }, {} as {[id: string]: ContactGroup}),
        };
      }
      break;
    case 'LOGOUT':
    case 'LOGIN_START':
      return initialState;
    default:
      // If the user is logged out clear all state.
      if ((action as ActionMessage).message &&
          (action as ActionMessage).message.errors &&
          (action as ActionMessage).message.errors.auth) {
        return initialState;
      }
  }
  return state;
}
