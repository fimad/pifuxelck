import {
  Action,
  LOGIN_START,
  LOGOUT,
  UI_UPDATE_OUTBOX,
} from '../actions';
import { Ui } from '../state';
import { mapFrom } from '../../common/utils';

const initialState = {outbox: {}};

export default function(state: Ui = initialState, action: Action) {
  if (action.type == LOGOUT || action.type == LOGIN_START) {
    return initialState;
  }
  if (action.type == UI_UPDATE_OUTBOX) {
    return {
      ...state,
      outbox: {
        ...state.outbox,
        [action.gameId]: action.turn,
      },
    };
  }
  return state;
}
