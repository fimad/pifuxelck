import { Action, ApiAction } from '../actions';
import { ApiStatus } from '../state';

function isApiAction(action: Action): action is ApiAction {
  return (action as ApiAction).apiName !== undefined &&
      (action as ApiAction).inProgress !== undefined;
}

const initialState: ApiStatus = {
  inProgress: {},
  pendingContactAdds: {},
  pendingContactDeletes: {},
  pendingSuggestionIgnores: {},
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
  if (action.type === 'REMOVE_CONTACT_START' ||
      action.type === 'REMOVE_CONTACT_SUCCESS' ||
      action.type === 'REMOVE_CONTACT_FAILURE') {
    return {
      ...nextState,
      pendingContactDeletes: {
        ...nextState.pendingContactDeletes,
        [action.contactId]: action.inProgress,
      },
    };
  }
  if (action.type === 'ADD_CONTACT_START' ||
      action.type === 'ADD_CONTACT_SUCCESS' ||
      action.type === 'ADD_CONTACT_FAILURE') {
    return {
      ...nextState,
      pendingContactAdds: {
        ...nextState.pendingContactAdds,
        [action.contactId]: action.inProgress,
      },
    };
  }
  if (action.type === 'IGNORE_SUGGESTION_START' ||
      action.type === 'IGNORE_SUGGESTION_SUCCESS' ||
      action.type === 'IGNORE_SUGGESTION_FAILURE') {
    return {
      ...nextState,
      pendingSuggestionIgnores: {
        ...nextState.pendingSuggestionIgnores,
        [action.contactId]: action.inProgress,
      },
    };
  }
  return nextState;
}
