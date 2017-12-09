import { Action, ApiAction } from '../actions';
import { ApiStatus } from '../state';

function isApiAction(action: Action): action is ApiAction {
  return (action as ApiAction).apiName !== undefined &&
      (action as ApiAction).inProgress !== undefined;
}

const initialState: ApiStatus = {
  inProgress: {},
  pendingTurns: {},
};

function maybeUpdateProgress(state: ApiStatus, action: Action): ApiStatus {
  if (isApiAction(action)) {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        [action.apiName]: action.inProgress,
      },
    };
  }
  return state;
}

export default function(state: ApiStatus = initialState, action: Action) {
  const nextState = maybeUpdateProgress(state, action);
  if (action.type === 'PLAY_GAME_START' ||
      action.type === 'PLAY_GAME_SUCCESS' ||
      action.type === 'PLAY_GAME_FAILURE') {
    return {
      ...nextState,
      pendingTurns: {
        ...nextState.pendingTurns,
        [action.gameId]: action.inProgress,
      },
    };
  }
  return nextState;
}
