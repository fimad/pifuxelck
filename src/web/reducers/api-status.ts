import { Action } from '../actions';

type ApiAction = Action & {
  apiName: string
  inProgress: string,
};

function isApiAction(action: Action): action is ApiAction {
  return (action as ApiAction).apiName !== undefined &&
      (action as ApiAction).inProgress !== undefined;
}

export default function(apiStatus = {}, action: Action) {
  if (isApiAction(action)) {
    return {
      ...apiStatus,
      [action.apiName]: action.inProgress,
    };
  }
  return apiStatus;
}
