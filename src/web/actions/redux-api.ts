import * as api from './api';
import { Dispatch } from 'redux';
import { State } from '../state';
import { Message } from '../../common/models/message';

export type Params = {
  start?: string,
  success?: string,
  failure?: string,
  url: string,
  body?: Message,
  onSuccess?: (message: Message) => void,
};

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
    apiCall: (url: string, message: Message, token?: string) => Promise<Message>,
    params: Params) {
  return (dispatch: Dispatch<State>, getState: () => State) => {
    if (params.start) {
      dispatch({type: params.start});
    }
    const {auth} = getState();
    apiCall(params.url, params.body, auth)
        .then((message) => {
          if (params.success) {
            dispatch({type: params.success, message});
          }
          if (params.onSuccess) {
            params.onSuccess(message);
          }
        })
        .catch(() => dispatch({type: params.failure}))
  };
}
