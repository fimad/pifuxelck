import { Dispatch } from 'redux';
import { Message } from '../../common/models/message';
import { ActionType, WebThunkAction } from '../actions';
import { State } from '../state';
import * as api from './api';
import { logout } from './logout';
import { addErrorSnak } from './ui';

export interface Params {
  errorMessage?: string;
  requireAuth?: boolean;
  allowConcurrent?: boolean;
  start?: ActionType;
  success?: ActionType;
  failure: ActionType;
  url: string;
  body?: Message;
  onSuccess?: (message: Message) => void;
  name: string;
  extra?: {
    [key: string]: any;
  };
}

export function get(params: Params) {
  return call(api.get, params);
}

export function post(params: Params) {
  return call(api.post, params);
}

export function put(params: Params) {
  return call(api.put, params);
}

export function del(params: Params) {
  return call(api.del, params);
}

export function call(
  apiCall: (
    url: string,
    message: Message,
    token?: string
  ) => Promise<api.ApiResult>,
  params: Params
): WebThunkAction {
  const extra = params.extra || {};
  return (dispatch, getState) => {
    const state = getState();
    if (!params.allowConcurrent && state.apiStatus.inProgress[params.name]) {
      return;
    }
    if (params.requireAuth && !state.auth) {
      return;
    }
    if (params.start) {
      dispatch({
        ...extra,
        apiName: params.name,
        inProgress: true,
        type: params.start,
      });
    }
    const { auth } = getState();
    const handleError = (message: Message | null) => {
      dispatch({
        ...extra,
        apiName: params.name,
        inProgress: false,
        type: params.failure,
      });
      if (message && message.errors && message.errors.auth) {
        dispatch(logout());
      } else if (
        message &&
        message.errors &&
        message.errors.application &&
        message.errors.application.length > 0
      ) {
        dispatch(addErrorSnak(message.errors.application[0]));
      } else if (params.errorMessage) {
        dispatch(addErrorSnak(params.errorMessage));
      }
    };
    apiCall(params.url, params.body, auth)
      .then(({ ok, message }) => {
        if (!ok) {
          handleError(message);
          return;
        }
        if (params.success) {
          dispatch({
            ...extra,
            apiName: params.name,
            inProgress: false,
            message,
            type: params.success,
          });
        }
        if (params.onSuccess) {
          params.onSuccess(message);
        }
      })
      .catch(handleError);
  };
}
