import { ContactGroup } from '../../common/models/contacts';
import { Message } from '../../common/models/message';
import { User } from '../../common/models/user';
import { mapFrom, objectWithoutKeys } from '../../common/utils';
import { Action } from '../actions';
import { Entities } from '../state';

interface ActionMessage {
  message: Message;
}

const initialState = {
  account: {
    email: '',
  },
  contactGroups: {},
  contacts: {},
  gameCache: {},
  history: {},
  inbox: {},
  users: {},
};

function handleOptimisticUpdate(state: Entities, action: Action) {
  switch (action.type) {
    case 'REMOVE_CONTACT_SUCCESS':
      return {
        ...state,
        contacts: objectWithoutKeys(state.contacts, [action.contactId]),
      };
    case 'PLAY_GAME_SUCCESS':
      return {
        ...state,
        inbox: objectWithoutKeys(state.inbox, [action.gameId]),
      };
  }
  return state;
}

function handleApiResult(state: Entities, action: Action) {
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
    case 'GET_GAME_SUCCESS':
      if (action.message && action.message.game) {
        return {
          ...state,
          gameCache: {
            ...state.gameCache,
            [action.message.game.id]: action.message.game,
          },
        };
      }
      break;
    case 'GET_HISTORY_SUCCESS':
      if (action.message && action.message.game_summaries) {
        return {
          ...state,
          history: {
            ...mapFrom(action.message.game_summaries, (x) => x.id),
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
    case 'GET_ACCOUNT_SUCCESS':
      if (action.message && action.message.user) {
        return {
          ...state,
          account: action.message.user,
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

export default function(state: Entities = initialState, action: Action) {
  return handleApiResult(handleOptimisticUpdate(state, action), action);
}
