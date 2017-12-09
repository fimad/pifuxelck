import { Dispatch } from 'redux';
import { Message } from '../../common/models/message';
import { State } from '../state';
import * as api from './api';

export interface Params {
  allowConcurrent?: boolean;
  start?: string;
  success?: string;
  failure: string;
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
    apiCall: (url: string, message: Message, token?: string) =>
        Promise<Message>,
    params: Params) {
  const extra = params.extra || {};
  return (dispatch: Dispatch<State>, getState: () => State) => {
    if (!params.allowConcurrent &&
        getState().apiStatus.inProgress[params.name]) {
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
    const {auth} = getState();
    apiCall(params.url, params.body, auth)
        .then((message) => {
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
        .catch(() => dispatch({
          ...extra,
          apiName: params.name,
          inProgress: false,
          type: params.failure,
        }));
  };
}
