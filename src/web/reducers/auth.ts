import {
  Action,
  LOGIN_FAILURE,
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../actions';

export default function(auth = '', action: Action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return action.message.meta.auth;
    case LOGIN_FAILURE:
    case LOGIN_START:
    case LOGOUT:
      return '';
    default:
      return auth;
  }
}
