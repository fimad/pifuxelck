import {
  Action,
  GET_HISTORY_RECEIVE,
  GET_INBOX_SUCCESS,
  LOGIN_START,
  LOGOUT,
  USER_LOOKUPUP_SUCCESS,
} from '../actions';
import { Entities } from '../state';
import { mapFrom } from '../../common/utils';

const initialState = {users: {}, history: {}, inbox: {}};

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
              ...mapFrom(action.message.inbox_entries, (x) => x.game_id)
          },
        };
      }
      break;
    case 'LOGOUT':
    case 'LOGIN_START':
      return initialState;
  }
  return state;
}
