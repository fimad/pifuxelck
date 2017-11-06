import {
  Action,
  GET_HISTORY_RECEIVE,
  LOGIN_START,
  LOGOUT,
  USER_LOOKUPUP_SUCCESS,
} from '../actions';
import { Entities } from '../state';
import { mapFrom } from '../../common/utils';

const initialState = {users: {}, history: {}, inbox: {}};

export default function(state: Entities = initialState, action: Action) {
  if (action.type == USER_LOOKUPUP_SUCCESS &&
      action.message && action.message.user) {
    return {
      ...state,
      users: Object.assign({}, state.users, {
        [action.message.user.display_name]: action.message.user.id,
      }),
    };
  }
  if (action.type == GET_HISTORY_RECEIVE &&
      action.message && action.message.games) {
    return {
      ...state,
      history: Object.assign(
          {}, state.history, mapFrom(action.message.games, (x) => x.id)),
    };
  }
  if (action.type == LOGOUT || action.type == LOGIN_START) {
      return initialState;
  }
  return state;
}
